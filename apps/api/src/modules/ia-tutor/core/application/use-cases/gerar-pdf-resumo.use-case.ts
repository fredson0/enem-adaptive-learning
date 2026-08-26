import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import { ObterContextoTutorUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';
import { ObterTrilhaUseCase } from '../../../../metricas/core/application/use-cases/obter-trilha.use-case';
import { getAssuntoById } from '../../../../metricas/core/application/helpers/trilha-assuntos.catalog';
import {
  CONVERSAS_TUTOR_REPOSITORY,
  type ConversasTutorRepositoryPort,
} from '../ports/conversas-tutor.repository.port';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort } from '../ports/ia-engine.port';
import {
  buildPdfResumoUserPrompt,
  CUSTO_TOKENS_PDF_RESUMO,
  extrairJsonPdfResumo,
  resolverNomeAssuntoPdf,
} from '../helpers/pdf-resumo.helper';
import { formatarHistoricoParaExtracao } from '../helpers/trilha-tutor.helper';
import type { ContextoTrilhaTutor } from '../helpers/trilha-tutor.helper';
import { buildTutorSystemPrompt } from '../helpers/tutor-prompts';
import { parseAreaEnem } from '../../../../questoes/core/application/helpers/area-enem';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';

const AREA_LABELS: Record<string, string> = {
  matematica: 'Matemática',
  linguagens: 'Linguagens',
  humanas: 'Ciências Humanas',
  natureza: 'Ciências da Natureza',
};

export type GerarPdfResumoInput = {
  userId: string;
  assuntoId?: string;
  assuntoNome?: string;
  areaSlug?: string;
  conteudoBase?: string;
  conversaId?: string;
};

@Injectable()
export class GerarPdfResumoUseCase {
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
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
  ) {}

  async execute(input: GerarPdfResumoInput) {
    const assuntoCatalogo = input.assuntoId
      ? getAssuntoById(input.assuntoId)
      : undefined;

    const assuntoNome = resolverNomeAssuntoPdf({
      assuntoId: input.assuntoId,
      assuntoNome: input.assuntoNome ?? assuntoCatalogo?.nome,
      conteudoBase: input.conteudoBase,
    });

    if (!assuntoNome) {
      throw new BadRequestException(
        'Informe o assunto ou use o botão Gerar PDF em uma explicação do tutor.',
      );
    }

    const areaSlug = input.areaSlug ?? assuntoCatalogo?.areaSlug;
    const areaLabel = areaSlug ? AREA_LABELS[areaSlug] : undefined;

    let historicoResumo: string | undefined;
    if (input.conversaId) {
      const conversa = await this.conversasRepository.obterPorId(
        input.userId,
        input.conversaId,
      );
      if (conversa?.mensagens.length) {
        historicoResumo = formatarHistoricoParaExtracao(
          conversa.mensagens.slice(-6),
        );
      }
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

    const tokens = await this.usoTokens.consumir(
      input.userId,
      CUSTO_TOKENS_PDF_RESUMO,
    );

    const systemPrompt = `${buildTutorSystemPrompt(
      perfil?.nivelAtual,
      contextoMetricas,
      contextoTrilha,
    )}

Você está gerando um material de estudo estruturado para exportar em PDF.
Responda somente com o JSON solicitado, sem texto antes ou depois.`;

    const respostaBruta = await this.iaEngine.enviarMensagem({
      texto: buildPdfResumoUserPrompt({
        assuntoNome,
        areaLabel,
        conteudoBase: input.conteudoBase,
        historicoResumo,
      }),
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
      contextoMetricas,
      contextoTrilha,
      systemPromptOverride: systemPrompt,
      responseFormat: 'json_object',
      areaEnem: areaSlug ? (parseAreaEnem(areaSlug) ?? undefined) : undefined,
    });

    const resumo = extrairJsonPdfResumo(respostaBruta);
    if (!resumo) {
      throw new ServiceUnavailableException(
        'Não foi possível gerar o material agora. Tente novamente.',
      );
    }

    return {
      resumo,
      assuntoNome,
      areaSlug: areaSlug ?? null,
      tokens,
    };
  }
}
