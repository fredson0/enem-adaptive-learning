import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObterCoberturaUseCase } from './obter-cobertura.use-case';
import {
  AREAS_ENEM,
  labelAreaEnem,
  slugAreaEnem,
} from '../helpers/area-enem-labels';
import {
  DISCIPLINAS_POR_AREA,
  estadoTrilhaVazio,
  isEtapaIdValida,
  labelPrioridade,
  montarEtapasArea,
  prioridadeTrilha,
  type ChecklistItemIa,
  type TrilhaEstado,
} from '../helpers/trilha.config';
import {
  formatarPerguntaTutor,
  montarMetaSemanalDinamica,
} from '../helpers/trilha-texto.helper';
import {
  calcularProgressoArea,
  enriquecerChecklistComAssunto,
} from '../helpers/trilha-progresso.helper';
import {
  agregarLacunasPorDisciplina,
  mesclarDisciplinasSugeridas,
  selecionarDisciplinasPorArea,
} from '../helpers/lacunas-disciplina.helper';
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
    const autoAvaliacao: Record<string, number> = {};

    for (const area of AREAS_ENEM) {
      const slug = slugAreaEnem(area);
      const valor = Number(input.autoAvaliacao?.[slug]);
      if (!Number.isFinite(valor) || valor < 1 || valor > 5) {
        throw new BadRequestException(
          `Autoavaliação inválida para ${labelAreaEnem(area)}. Use valores de 1 a 5.`,
        );
      }
      autoAvaliacao[slug] = valor;
    }

    const estadoAtual =
      (await this.metricasRepository.obterTrilhaEstado(input.userId)) ??
      estadoTrilhaVazio();

    const estado: TrilhaEstado = {
      ...estadoAtual,
      diagnostico: {
        completo: true,
        concluidoEm: new Date().toISOString(),
        autoAvaliacao,
        disciplinasFracas: input.disciplinasFracas ?? [],
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
    @Inject(ObterCoberturaUseCase)
    private readonly obterCoberturaUseCase: ObterCoberturaUseCase,
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
    const checklistIa = enriquecerChecklistComAssunto(estado.checklistIa ?? []);
    const respostasDisciplina =
      await this.metricasRepository.listarRespostasPorDisciplina(userId);
    const lacunasPorDisciplina = agregarLacunasPorDisciplina(
      respostasDisciplina,
      { limite: 12 },
    );

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

      const disciplinasSugeridas = mesclarDisciplinasSugeridas(
        selecionarDisciplinasPorArea(lacunasPorDisciplina, slug),
        disciplinasFoco,
        disciplinasArea.slice(0, 2),
      );

      const etapas = montarEtapasArea({
        slug,
        label,
        scoreCombinado,
        disciplinasFoco: disciplinasSugeridas,
        etapasConcluidas,
      });

      const checklistArea = checklistIa.filter(
        (item) => !item.areaSlug || item.areaSlug === slug,
      );
      const progresso = calcularProgressoArea(etapas, checklistArea);
      const proximaEtapa = etapas.find((etapa) => !etapa.concluida) ?? null;

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
        proximaEtapa,
        perguntaTutor: formatarPerguntaTutor(label, disciplinasSugeridas),
      };
    }).sort((a, b) => b.scoreCombinado - a.scoreCombinado);

    const cobertura = await this.obterCoberturaUseCase.execute(userId);
    const progressoPorAssunto = cobertura.progressoPorAssunto;
    const coberturaPorAssunto = cobertura.coberturaPorAssunto;

    const foco = areas[0];
    const minutosPorDia = Math.max(30, Math.round(tempoDiario / 4));
    const metaSemanal = estado.diagnostico.completo
      ? foco
        ? montarMetaSemanalDinamica({
            minutosPorDia,
            areaLabel: foco.label,
            disciplinas: foco.disciplinasSugeridas,
            proximaEtapa: foco.proximaEtapa,
            metaIa:
              estado.planoIa?.areaSlug === foco.slug
                ? estado.planoIa.metaSemanal
                : undefined,
          })
        : 'Mantenha ritmo com simulados variados.'
      : 'Complete o diagnóstico para receber sua trilha personalizada.';

    return {
      diagnosticoCompleto: estado.diagnostico.completo,
      metaEnem: estado.diagnostico.metaEnem ?? null,
      metaSemanal,
      planoIa: estado.planoIa ?? null,
      checklistIa,
      progressoPorAssunto,
      coberturaPorAssunto,
      lacunasPorDisciplina,
      tempoDiarioMinutos: tempoDiario,
      areas,
      areaPrioritaria: foco?.slug ?? null,
    };
  }
}

export type MarcarEtapaTrilhaInput = {
  userId: string;
  etapaId: string;
  concluida: boolean;
};

@Injectable()
export class MarcarEtapaTrilhaUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(input: MarcarEtapaTrilhaInput) {
    if (!isEtapaIdValida(input.etapaId)) {
      throw new BadRequestException('Etapa inválida.');
    }

    const estado =
      (await this.metricasRepository.obterTrilhaEstado(input.userId)) ??
      estadoTrilhaVazio();

    const etapas = new Set(estado.etapasConcluidas);

    if (input.concluida) {
      etapas.add(input.etapaId);
    } else {
      etapas.delete(input.etapaId);
    }

    const novoEstado: TrilhaEstado = {
      ...estado,
      etapasConcluidas: Array.from(etapas),
    };

    await this.metricasRepository.salvarTrilhaEstado(
      input.userId,
      novoEstado,
    );

    return { ok: true, etapasConcluidas: novoEstado.etapasConcluidas };
  }
}

export type MarcarChecklistIaInput = {
  userId: string;
  itemId: string;
  concluida: boolean;
};

@Injectable()
export class MarcarChecklistIaUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(input: MarcarChecklistIaInput) {
    const estado =
      (await this.metricasRepository.obterTrilhaEstado(input.userId)) ??
      estadoTrilhaVazio();

    const checklist = estado.checklistIa ?? [];
    const indice = checklist.findIndex((item) => item.id === input.itemId);

    if (indice < 0) {
      throw new BadRequestException('Item de checklist não encontrado.');
    }

    const atualizado: ChecklistItemIa[] = checklist.map((item, index) =>
      index === indice ? { ...item, concluida: input.concluida } : item,
    );

    const novoEstado: TrilhaEstado = {
      ...estado,
      checklistIa: atualizado,
    };

    await this.metricasRepository.salvarTrilhaEstado(input.userId, novoEstado);

    return { ok: true, checklistIa: atualizado };
  }
}
