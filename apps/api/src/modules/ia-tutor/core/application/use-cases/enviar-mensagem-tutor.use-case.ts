import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import { ObterContextoTutorUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';
import { ObterTrilhaUseCase } from '../../../../metricas/core/application/use-cases/obter-trilha.use-case';
import { ObterFrequenciaTemasUseCase } from '../../../../metricas/core/application/use-cases/obter-frequencia-temas.use-case';
import { ObterLacunasUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';
import { ObterCoberturaUseCase } from '../../../../metricas/core/application/use-cases/obter-cobertura.use-case';
import { inferirAssuntoId } from '../../../../metricas/core/application/helpers/cobertura-questoes.helper';
import { slugAreaEnem } from '../../../../metricas/core/application/helpers/area-enem-labels';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../../../../metricas/core/application/ports/metricas.repository.port';
import { estadoTrilhaVazio } from '../../../../metricas/core/application/helpers/trilha.config';
import { GerarSimuladoComIaUseCase } from '../../../../simulados/core/application/use-cases/gerar-simulado-com-ia.use-case';
import {
  aplicarTrilhaAcoes,
  parseTrilhaAcoes,
  type ContextoTrilhaTutor,
} from '../helpers/trilha-tutor.helper';
import { buildConversaTitulo } from '../helpers/conversa-title.helper';
import {
  avaliarEscopoMensagem,
  respostaForaEscopo,
} from '../helpers/tutor-escopo.helper';
import { classificarIntencaoTutor } from '../helpers/tutor-intencao.helper';
import {
  formatarRespostaCobertura,
  selecionarAssuntosCoberturaParaPrompt,
} from '../helpers/tutor-cobertura.helper';
import {
  buildTutorSystemPrompt,
  detectarAreaEnem,
  formatarRespostaFrequenciaTemas,
  formatarRespostaLacunas,
  formatarRespostaProgresso,
} from '../helpers/tutor-prompts';
import {
  isPedidoExplicacao,
  sanitizarRespostaTutor,
} from '../helpers/tutor-formato.helper';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort, ImagemAnexo } from '../ports/ia-engine.port';
import {
  CONVERSAS_TUTOR_REPOSITORY,
  type ConversasTutorRepositoryPort,
} from '../ports/conversas-tutor.repository.port';
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '../ports/object-storage.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';

export type EnviarMensagemTutorInput = {
  userId: string;
  mensagem: string;
  conversaId?: string;
  anexoUrl?: string;
};

export type TutorStreamCallbacks = {
  onDelta: (text: string) => void | Promise<void>;
};

export type EnviarMensagemTutorResult = {
  resposta: string;
  conversaId: string;
  tokens: Awaited<ReturnType<UsoTokensIaService['obterSaldo']>>;
  trilhaAtualizada?: {
    etapasConcluidas: string[];
    checklistIa: import('../../../../metricas/core/application/helpers/trilha.config').ChecklistItemIa[];
  };
  simuladoGerado?: {
    id: string;
    href: string;
    totalQuestoes: number;
  };
  foraEscopo?: boolean;
};

@Injectable()
export class EnviarMensagemTutorUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
    @Inject(ObterContextoTutorUseCase)
    private readonly obterContextoTutorUseCase: ObterContextoTutorUseCase,
    @Inject(ObterTrilhaUseCase)
    private readonly obterTrilhaUseCase: ObterTrilhaUseCase,
    @Inject(ObterFrequenciaTemasUseCase)
    private readonly obterFrequenciaTemasUseCase: ObterFrequenciaTemasUseCase,
    @Inject(ObterLacunasUseCase)
    private readonly obterLacunasUseCase: ObterLacunasUseCase,
    @Inject(ObterCoberturaUseCase)
    private readonly obterCoberturaUseCase: ObterCoberturaUseCase,
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
    @Inject(forwardRef(() => GerarSimuladoComIaUseCase))
    private readonly gerarSimuladoComIaUseCase: GerarSimuladoComIaUseCase,
  ) {}

  private async resolverImagem(anexoUrl?: string): Promise<ImagemAnexo | undefined> {
    if (!anexoUrl) return undefined;

    const key = this.storage.resolverKeyDeUrl(anexoUrl);
    if (!key) return undefined;

    const arquivo = await this.storage.obterArquivo(key);
    if (!arquivo) return undefined;

    return {
      mimeType: arquivo.contentType,
      base64: arquivo.buffer.toString('base64'),
    };
  }

  private async persistirResposta(
    conversaId: string,
    mensagemUsuario: string,
    anexoUrl: string | undefined,
    resposta: string,
    conversaMensagens: { role: 'user' | 'assistant'; texto: string }[] | undefined,
  ) {
    const novasMensagens = [
      {
        role: 'user' as const,
        texto: mensagemUsuario,
        anexoUrl,
      },
      { role: 'assistant' as const, texto: resposta },
    ];

    await this.conversasRepository.adicionarMensagens(conversaId, novasMensagens);

    const todasMensagens = [...(conversaMensagens ?? []), ...novasMensagens];
    if (todasMensagens.length <= 2) {
      await this.conversasRepository.atualizarTitulo(
        conversaId,
        buildConversaTitulo(todasMensagens),
      );
    }
  }

  async execute(input: EnviarMensagemTutorInput) {
    return this.run(input);
  }

  async executeStream(
    input: EnviarMensagemTutorInput,
    callbacks: TutorStreamCallbacks,
  ) {
    return this.run(input, callbacks);
  }

  private async emitResposta(
    callbacks: TutorStreamCallbacks | undefined,
    resposta: string,
  ) {
    if (callbacks) {
      await callbacks.onDelta(resposta);
    }
  }

  private async run(
    input: EnviarMensagemTutorInput,
    callbacks?: TutorStreamCallbacks,
  ): Promise<EnviarMensagemTutorResult> {
    let conversaId = input.conversaId;

    if (conversaId) {
      const existente = await this.conversasRepository.obterPorId(
        input.userId,
        conversaId,
      );
      if (!existente) {
        throw new NotFoundException('Conversa não encontrada');
      }
    } else {
      const criada = await this.conversasRepository.criar(input.userId);
      conversaId = criada.id;
    }

    const conversa = await this.conversasRepository.obterPorId(
      input.userId,
      conversaId,
    );

    const escopo = avaliarEscopoMensagem(
      input.mensagem,
      conversa?.mensagens,
    );
    if (escopo.escopo === 'fora_escopo') {
      const resposta = respostaForaEscopo(escopo.motivo);
      const tokens = await this.usoTokens.obterSaldo(input.userId);

      await this.persistirResposta(
        conversaId,
        input.mensagem,
        input.anexoUrl,
        resposta,
        conversa?.mensagens,
      );

      await this.emitResposta(callbacks, resposta);

      return {
        resposta,
        conversaId,
        tokens,
        foraEscopo: true,
      };
    }

    const perfil = await this.usuariosRepository.obterPerfilAluno(input.userId);
    const contextoMetricas = await this.obterContextoTutorUseCase.execute(
      input.userId,
    );
    const trilha = await this.obterTrilhaUseCase.execute(input.userId);
    const contextoTrilha: ContextoTrilhaTutor = {
      diagnosticoCompleto: trilha.diagnosticoCompleto,
      metaEnem: trilha.metaEnem,
      areaPrioritaria: trilha.areaPrioritaria,
      areas: trilha.areas.map((area) => ({
        slug: area.slug,
        label: area.label,
        progresso: area.progresso,
        disciplinasSugeridas: area.disciplinasSugeridas,
        proximaEtapa: area.proximaEtapa
          ? { id: area.proximaEtapa.id, titulo: area.proximaEtapa.titulo }
          : null,
        etapas: area.etapas.map((etapa) => ({
          id: etapa.id,
          titulo: etapa.titulo,
          concluida: etapa.concluida,
        })),
      })),
      checklistIa: trilha.checklistIa,
      planoIa: trilha.planoIa,
    };

    const intencao = classificarIntencaoTutor(input.mensagem);
    const areaDetectada = detectarAreaEnem(input.mensagem);

    if (intencao === 'gerar_simulado') {
      const tokens = await this.usoTokens.consumir(input.userId, 1);

      try {
        const simulado = await this.gerarSimuladoComIaUseCase.execute({
          userId: input.userId,
          pedido: input.mensagem,
          modo: 'TREINO',
        });

        const resposta = sanitizarRespostaTutor(
          `Montei um treino com ${simulado.totalQuestoes} questões para você.\n\nAbra em Simulados ou comece aqui: /simulados/${simulado.id}`,
        );

        await this.persistirResposta(
          conversaId,
          input.mensagem,
          input.anexoUrl,
          resposta,
          conversa?.mensagens,
        );

        await this.emitResposta(callbacks, resposta);

        return {
          resposta,
          conversaId,
          tokens,
          simuladoGerado: {
            id: simulado.id,
            href: `/simulados/${simulado.id}`,
            totalQuestoes: simulado.totalQuestoes,
          },
        };
      } catch {
        const resposta = sanitizarRespostaTutor(
          'Não consegui montar o simulado automaticamente com esse pedido. Tente ser mais específico (ex.: "10 questões de matemática sobre funções") ou vá em Simulados → Novo treino.',
        );

        await this.persistirResposta(
          conversaId,
          input.mensagem,
          input.anexoUrl,
          resposta,
          conversa?.mensagens,
        );

        await this.emitResposta(callbacks, resposta);

        return { resposta, conversaId, tokens };
      }
    }

    if (intencao === 'frequencia_temas') {
      const tokens = await this.usoTokens.obterSaldo(input.userId);
      const { disciplinas } = await this.obterFrequenciaTemasUseCase.execute(
        areaDetectada ? slugAreaEnem(areaDetectada) : undefined,
      );
      const resposta = formatarRespostaFrequenciaTemas(
        disciplinas,
        areaDetectada,
      );

      await this.persistirResposta(
        conversaId,
        input.mensagem,
        input.anexoUrl,
        resposta,
        conversa?.mensagens,
      );

      await this.emitResposta(callbacks, resposta);

      return { resposta, conversaId, tokens };
    }

    if (intencao === 'minhas_lacunas') {
      const tokens = await this.usoTokens.obterSaldo(input.userId);
      const lacunas = await this.obterLacunasUseCase.execute(input.userId);
      const resposta = formatarRespostaLacunas(lacunas);

      await this.persistirResposta(
        conversaId,
        input.mensagem,
        input.anexoUrl,
        resposta,
        conversa?.mensagens,
      );

      await this.emitResposta(callbacks, resposta);

      return { resposta, conversaId, tokens };
    }

    if (intencao === 'meu_progresso') {
      const tokens = await this.usoTokens.obterSaldo(input.userId);
      const contextoMetricas = await this.obterContextoTutorUseCase.execute(
        input.userId,
      );
      const resposta = formatarRespostaProgresso(contextoMetricas);

      await this.persistirResposta(
        conversaId,
        input.mensagem,
        input.anexoUrl,
        resposta,
        conversa?.mensagens,
      );

      await this.emitResposta(callbacks, resposta);

      return { resposta, conversaId, tokens };
    }

    if (intencao === 'minha_cobertura') {
      const tokens = await this.usoTokens.obterSaldo(input.userId);
      const cobertura = await this.obterCoberturaUseCase.execute(input.userId);
      const resposta = formatarRespostaCobertura({
        areas: cobertura.areas,
        assuntos: cobertura.assuntos,
        areaSlug: areaDetectada ? slugAreaEnem(areaDetectada) : null,
      });

      await this.persistirResposta(
        conversaId,
        input.mensagem,
        input.anexoUrl,
        resposta,
        conversa?.mensagens,
      );

      await this.emitResposta(callbacks, resposta);

      return { resposta, conversaId, tokens };
    }

    const custoTokens = input.anexoUrl ? 2 : 1;
    const tokens = await this.usoTokens.consumir(input.userId, custoTokens);
    const imagem = await this.resolverImagem(input.anexoUrl);

    if (input.anexoUrl && !imagem) {
      throw new NotFoundException('Anexo não encontrado. Envie a imagem novamente.');
    }

    let frequencias: Awaited<
      ReturnType<ObterFrequenciaTemasUseCase['execute']>
    >['disciplinas'] = [];

    if (intencao === 'chat_livre' && areaDetectada) {
      const freq = await this.obterFrequenciaTemasUseCase.execute(
        slugAreaEnem(areaDetectada),
      );
      frequencias = freq.disciplinas;
    }

    let coberturaAssuntos: ReturnType<
      typeof selecionarAssuntosCoberturaParaPrompt
    > = [];

    if (
      contextoMetricas.questoesRespondidas > 0 &&
      (intencao === 'chat_livre' || intencao === 'produto_plataforma')
    ) {
      const cobertura = await this.obterCoberturaUseCase.execute(input.userId);
      const areaSlug = areaDetectada ? slugAreaEnem(areaDetectada) : null;
      const assuntoId = inferirAssuntoId(input.mensagem, areaSlug ?? undefined);

      coberturaAssuntos = selecionarAssuntosCoberturaParaPrompt(
        cobertura.assuntos,
        {
          areaSlug,
          assuntoId: assuntoId ?? null,
          limit: 6,
        },
      );
    }

    const pedidoExplicacao = isPedidoExplicacao(input.mensagem);

    const systemPromptOverride = buildTutorSystemPrompt(
      perfil?.nivelAtual ?? 'INICIANTE',
      contextoMetricas,
      contextoTrilha,
      {
        areaEnem: areaDetectada,
        frequencias,
        coberturaAssuntos,
        incluirProduto: intencao === 'produto_plataforma',
        pedidoExplicacao,
      },
    );

    const respostaBruta = callbacks
      ? await this.iaEngine.enviarMensagemStream(
          {
            texto: input.mensagem,
            historico: conversa?.mensagens,
            nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
            contextoMetricas,
            contextoTrilha,
            imagem,
            systemPromptOverride,
            areaEnem: areaDetectada ?? undefined,
          },
          callbacks.onDelta,
        )
      : await this.iaEngine.enviarMensagem({
          texto: input.mensagem,
          historico: conversa?.mensagens,
          nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
          contextoMetricas,
          contextoTrilha,
          imagem,
          systemPromptOverride,
          areaEnem: areaDetectada ?? undefined,
        });

    const acoes = parseTrilhaAcoes(respostaBruta);
    let trilhaAtualizada:
      | { etapasConcluidas: string[]; checklistIa: typeof trilha.checklistIa }
      | undefined;

    if (
      acoes.etapasConcluir.length > 0 ||
      acoes.checklistAdicionar.length > 0
    ) {
      const estado =
        (await this.metricasRepository.obterTrilhaEstado(input.userId)) ??
        estadoTrilhaVazio();
      const novoEstado = aplicarTrilhaAcoes(
        estado,
        acoes,
        trilha.areaPrioritaria ?? undefined,
      );
      await this.metricasRepository.salvarTrilhaEstado(
        input.userId,
        novoEstado,
      );
      trilhaAtualizada = {
        etapasConcluidas: novoEstado.etapasConcluidas,
        checklistIa: novoEstado.checklistIa ?? [],
      };
    }

    const resposta = sanitizarRespostaTutor(acoes.textoLimpo || respostaBruta);

    await this.persistirResposta(
      conversaId,
      input.mensagem,
      input.anexoUrl,
      resposta,
      conversa?.mensagens,
    );

    return {
      resposta,
      conversaId,
      tokens,
      trilhaAtualizada,
    };
  }
}
