import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AREAS_ENEM,
  labelAreaEnem,
  slugAreaEnem,
} from '../helpers/area-enem-labels';
import {
  DISCIPLINAS_POR_AREA,
  estadoTrilhaVazio,
  labelPrioridade,
  montarEtapasArea,
  prioridadeTrilha,
  type TrilhaEstado,
} from '../helpers/trilha.config';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../ports/metricas.repository.port';

export type SalvarDiagnosticoTrilhaInput = {
  userId: string;
  autoAvaliacao: Record<string, number>;
  disciplinasFracas: string[];
  metaEnem?: string;
};

@Injectable()
export class SalvarDiagnosticoTrilhaUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(input: SalvarDiagnosticoTrilhaInput) {
    for (const area of AREAS_ENEM) {
      const slug = slugAreaEnem(area);
      const valor = input.autoAvaliacao[slug];
      if (valor === undefined || valor < 1 || valor > 5) {
        throw new BadRequestException(
          `Autoavaliação inválida para ${labelAreaEnem(area)}. Use valores de 1 a 5.`,
        );
      }
    }

    const estadoAtual =
      (await this.metricasRepository.obterTrilhaEstado(input.userId)) ??
      estadoTrilhaVazio();

    const estado: TrilhaEstado = {
      ...estadoAtual,
      diagnostico: {
        completo: true,
        concluidoEm: new Date().toISOString(),
        autoAvaliacao: input.autoAvaliacao,
        disciplinasFracas: input.disciplinasFracas,
        metaEnem: input.metaEnem?.trim() || undefined,
      },
    };

    await this.metricasRepository.salvarTrilhaEstado(input.userId, estado);

    return { ok: true };
  }
}

@Injectable()
export class ObterTrilhaUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(userId: string) {
    const estado =
      (await this.metricasRepository.obterTrilhaEstado(userId)) ??
      estadoTrilhaVazio();

    const proficiencias =
      await this.metricasRepository.listarProficiencias(userId);
    const mapaProf = new Map(proficiencias.map((row) => [row.area, row]));
    const tempoDiario =
      await this.metricasRepository.obterTempoDiarioMinutos(userId);
    const etapasConcluidas = new Set(estado.etapasConcluidas);

    const areas = AREAS_ENEM.map((area) => {
      const slug = slugAreaEnem(area);
      const label = labelAreaEnem(area);
      const prof = mapaProf.get(area);
      const proficienciaReal = prof ? Number(prof.score) : 0;
      const autoAvaliacao = estado.diagnostico.autoAvaliacao[slug] ?? 3;
      const temProficiencia = Boolean(prof && prof.totalQuestoes > 0);
      const scoreCombinado = prioridadeTrilha(
        autoAvaliacao,
        proficienciaReal,
        temProficiencia,
      );

      const disciplinasArea = DISCIPLINAS_POR_AREA[slug] ?? [];
      const disciplinasFoco = estado.diagnostico.disciplinasFracas.filter((item) =>
        disciplinasArea.some(
          (disciplina) =>
            disciplina.toLowerCase() === item.toLowerCase() ||
            item.toLowerCase().includes(disciplina.toLowerCase()),
        ),
      );

      const disciplinasSugeridas =
        disciplinasFoco.length > 0
          ? disciplinasFoco
          : disciplinasArea.slice(0, 2);

      const etapas = montarEtapasArea({
        slug,
        label,
        scoreCombinado,
        disciplinasFoco: disciplinasSugeridas,
        etapasConcluidas,
      });

      const etapasConcluidasCount = etapas.filter((etapa) => etapa.concluida).length;
      const progresso =
        etapas.length > 0
          ? Math.round((etapasConcluidasCount / etapas.length) * 100)
          : 0;

      return {
        area,
        slug,
        label,
        prioridade: labelPrioridade(scoreCombinado),
        scoreCombinado,
        proficienciaReal,
        autoAvaliacao,
        totalQuestoes: prof?.totalQuestoes ?? 0,
        disciplinasSugeridas,
        progresso,
        etapas,
        perguntaTutor: `Estou montando minha trilha no ENEM+. Minha maior dificuldade em ${label} é em ${disciplinasSugeridas.join(' e ')}. Por onde devo começar a estudar?`,
      };
    }).sort((a, b) => b.scoreCombinado - a.scoreCombinado);

    const foco = areas[0];
    const minutosPorDia = Math.max(30, Math.round(tempoDiario / 4));
    const metaSemanal = estado.diagnostico.completo
      ? foco
        ? `Esta semana: ${minutosPorDia} min/dia em ${foco.label} — comece pelo treino guiado e revise os erros.`
        : 'Mantenha ritmo com simulados variados.'
      : 'Complete o diagnóstico para receber sua trilha personalizada.';

    return {
      diagnosticoCompleto: estado.diagnostico.completo,
      metaEnem: estado.diagnostico.metaEnem ?? null,
      metaSemanal,
      tempoDiarioMinutos: tempoDiario,
      areas,
      areaPrioritaria: foco?.slug ?? null,
    };
  }
}
