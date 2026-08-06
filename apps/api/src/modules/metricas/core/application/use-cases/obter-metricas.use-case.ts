import { Inject, Injectable } from '@nestjs/common';
import {
  AREAS_ENEM,
  labelAreaEnem,
  slugAreaEnem,
} from '../helpers/area-enem-labels';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../ports/metricas.repository.port';

function prioridade(score: number): 'Alta' | 'Média' | 'Baixa' {
  if (score < 50) return 'Alta';
  if (score < 70) return 'Média';
  return 'Baixa';
}

@Injectable()
export class ObterProficienciaUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(userId: string) {
    const rows = await this.metricasRepository.listarProficiencias(userId);
    const mapa = new Map(rows.map((row) => [row.area, row]));

    const areas = AREAS_ENEM.map((area) => {
      const row = mapa.get(area);
      const score = row?.score ?? 0;
      return {
        area,
        slug: slugAreaEnem(area),
        label: labelAreaEnem(area),
        score,
        totalQuestoes: row?.totalQuestoes ?? 0,
        acertos: row?.acertos ?? 0,
        atualizadoEm: row?.atualizadoEm ?? null,
      };
    });

    const resumo = await this.metricasRepository.obterResumoSimulados(userId);
    const ultimo = await this.metricasRepository.obterUltimoSimulado(userId);

    return {
      areas,
      resumo: {
        simuladosConcluidos: resumo.simuladosConcluidos,
        questoesRespondidas: resumo.questoesRespondidas,
        mediaGeralPercentual: resumo.mediaGeralPercentual,
      },
      ultimoSimulado: ultimo
        ? {
            id: ultimo.id,
            area: ultimo.area,
            slug: ultimo.area ? slugAreaEnem(ultimo.area) : null,
            label: ultimo.area ? labelAreaEnem(ultimo.area) : null,
            acertos: ultimo.acertos,
            totalQuestoes: ultimo.totalQuestoes,
            percentual:
              ultimo.totalQuestoes > 0
                ? Math.round((ultimo.acertos / ultimo.totalQuestoes) * 1000) /
                  10
                : 0,
            finalizadoEm: ultimo.finalizadoEm,
          }
        : null,
    };
  }
}

@Injectable()
export class ObterEvolucaoUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(userId: string) {
    const pontos = await this.metricasRepository.listarEvolucao(userId, 10);

    return {
      pontos: pontos.map((ponto) => ({
        simuladoId: ponto.simuladoId,
        area: ponto.area,
        slug: ponto.area ? slugAreaEnem(ponto.area) : null,
        label: ponto.area ? labelAreaEnem(ponto.area) : null,
        acertos: ponto.acertos,
        totalQuestoes: ponto.totalQuestoes,
        percentual:
          ponto.totalQuestoes > 0
            ? Math.round((ponto.acertos / ponto.totalQuestoes) * 1000) / 10
            : 0,
        finalizadoEm: ponto.finalizadoEm,
      })),
    };
  }
}

@Injectable()
export class ObterLacunasUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(userId: string) {
    const rows = await this.metricasRepository.listarProficiencias(userId);
    const mapa = new Map(rows.map((row) => [row.area, row]));

    const lacunas = AREAS_ENEM.map((area) => {
      const row = mapa.get(area);
      const score = row?.score ?? 0;
      const prio = prioridade(score);
      const label = labelAreaEnem(area);
      const slug = slugAreaEnem(area);

      return {
        area,
        slug,
        label,
        score,
        totalQuestoes: row?.totalQuestoes ?? 0,
        acertos: row?.acertos ?? 0,
        prioridade: prio,
        mensagem:
          score === 0
            ? `Você ainda não praticou ${label}. Comece com um simulado focado.`
            : prio === 'Alta'
              ? `${label} é sua maior lacuna (${score}% de acerto). Priorize esta semana.`
              : prio === 'Média'
                ? `${label} precisa de reforço (${score}% de acerto).`
                : `${label} está em bom nível (${score}%). Mantenha revisões leves.`,
        simuladoSugerido: {
          area: slug,
          quantidade: score < 50 ? 10 : 5,
        },
        perguntaTutor: `Com base nos meus simulados, quais são os principais pontos que devo revisar em ${label}? Meu aproveitamento atual é ${score}%.`,
      };
    })
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    const pior = lacunas[0];
    const metaSemanal =
      pior && pior.score < 70
        ? `Foque em ${pior.label} — faça ${pior.simuladoSugerido.quantidade} questões em simulado focado esta semana.`
        : 'Mantenha o ritmo com simulados variados e revise erros com o tutor IA.';

    return {
      metaSemanal,
      lacunas,
      checklist: [
        {
          id: 'simulado-focado',
          texto: `Fazer simulado focado${pior ? ` em ${pior.label}` : ''}`,
          concluido: false,
        },
        {
          id: 'revisar-erros',
          texto: 'Revisar questões erradas com "Explicar com IA"',
          concluido: false,
        },
        {
          id: 'pergunta-tutor',
          texto: 'Fazer 1 pergunta ao tutor sobre sua lacuna',
          concluido: false,
        },
      ],
    };
  }
}

@Injectable()
export class ObterContextoTutorUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(userId: string) {
    const proficiencias = await this.metricasRepository.listarProficiencias(
      userId,
    );
    const resumo = await this.metricasRepository.obterResumoSimulados(userId);
    const ultimo = await this.metricasRepository.obterUltimoSimulado(userId);

    const lacunas = [...proficiencias]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((row) => ({
        area: labelAreaEnem(row.area),
        score: row.score,
        totalQuestoes: row.totalQuestoes,
      }));

    return {
      simuladosConcluidos: resumo.simuladosConcluidos,
      questoesRespondidas: resumo.questoesRespondidas,
      mediaGeralPercentual: resumo.mediaGeralPercentual,
      proficiencias: proficiencias.map((row) => ({
        area: labelAreaEnem(row.area),
        score: row.score,
        acertos: row.acertos,
        totalQuestoes: row.totalQuestoes,
      })),
      lacunas,
      ultimoSimulado: ultimo
        ? {
            area: ultimo.area ? labelAreaEnem(ultimo.area) : 'Geral',
            acertos: ultimo.acertos,
            totalQuestoes: ultimo.totalQuestoes,
            percentual:
              ultimo.totalQuestoes > 0
                ? Math.round((ultimo.acertos / ultimo.totalQuestoes) * 1000) /
                  10
                : 0,
            finalizadoEm: ultimo.finalizadoEm,
          }
        : null,
    };
  }
}
