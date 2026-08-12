import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import { ObterContextoTutorUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';
import { ObterTrilhaUseCase } from '../../../../metricas/core/application/use-cases/obter-trilha.use-case';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../../../../metricas/core/application/ports/metricas.repository.port';
import { estadoTrilhaVazio } from '../../../../metricas/core/application/helpers/trilha.config';
import {
  aplicarTrilhaAcoes,
  parseTrilhaAcoes,
  type ContextoTrilhaTutor,
} from '../helpers/trilha-tutor.helper';
import { buildConversaTitulo } from '../helpers/conversa-title.helper';
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
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
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

  async execute(input: EnviarMensagemTutorInput) {
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
    const custoTokens = input.anexoUrl ? 2 : 1;
    const tokens = await this.usoTokens.consumir(input.userId, custoTokens);
    const imagem = await this.resolverImagem(input.anexoUrl);

    if (input.anexoUrl && !imagem) {
      throw new NotFoundException('Anexo não encontrado. Envie a imagem novamente.');
    }

    const respostaBruta = await this.iaEngine.enviarMensagem({
      texto: input.mensagem,
      historico: conversa?.mensagens,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
      contextoMetricas,
      contextoTrilha,
      imagem,
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

    const resposta = acoes.textoLimpo || respostaBruta;

    const novasMensagens = [
      {
        role: 'user' as const,
        texto: input.mensagem,
        anexoUrl: input.anexoUrl,
      },
      { role: 'assistant' as const, texto: resposta },
    ];

    await this.conversasRepository.adicionarMensagens(
      conversaId,
      novasMensagens,
    );

    const todasMensagens = [...(conversa?.mensagens ?? []), ...novasMensagens];
    if (todasMensagens.length <= 2) {
      await this.conversasRepository.atualizarTitulo(
        conversaId,
        buildConversaTitulo(todasMensagens),
      );
    }

    return {
      resposta,
      conversaId,
      tokens,
      trilhaAtualizada,
    };
  }
}
