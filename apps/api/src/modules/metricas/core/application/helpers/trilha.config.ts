import { AreaEnem } from '@generated/prisma';
import { formatarListaAssuntos } from './trilha-texto.helper';

export type TrilhaDiagnostico = {
  completo: boolean;
  concluidoEm?: string;
  autoAvaliacao: Record<string, number>;
  disciplinasFracas: string[];
  metaEnem?: string;
};

export type ChecklistItemIa = {
  id: string;
  texto: string;
  concluida: boolean;
  areaSlug?: string;
  assuntoId?: string;
  criadoEm: string;
};

export type PlanoIa = {
  atualizadoEm: string;
  metaSemanal: string;
  proximoPasso: string;
  areaSlug: string;
  resumo?: string;
};

export type TrilhaEstado = {
  diagnostico: TrilhaDiagnostico;
  etapasConcluidas: string[];
  checklistIa?: ChecklistItemIa[];
  planoIa?: PlanoIa;
};

export type TrilhaEtapaTipo =
  | 'orientacao'
  | 'treino'
  | 'modalidade'
  | 'revisao'
  | 'tutor'
  | 'cronometrado';

export type TrilhaEtapa = {
  id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  tipo: TrilhaEtapaTipo;
  href?: string;
  concluida: boolean;
};

/** Assuntos de maior incidência no ENEM — curadoria, não lista exaustiva. */
export const DISCIPLINAS_POR_AREA: Record<string, string[]> = {
  matematica: [
    'Funções',
    'Geometria',
    'Probabilidade',
    'Porcentagem',
    'Estatística',
    'Razão e proporção',
  ],
  linguagens: [
    'Língua Portuguesa',
    'Interpretação de texto',
    'Literatura',
    'Gramática',
    'Redação',
    'Gêneros textuais',
    'Figuras de linguagem',
    'Inglês',
    'Espanhol',
  ],
  humanas: [
    'História',
    'Geografia',
    'Sociologia',
    'Filosofia',
    'Atualidades',
  ],
  natureza: [
    'Física',
    'Química',
    'Biologia',
    'Ecologia',
    'Energia e meio ambiente',
  ],
};

export const AREA_SLUG_TO_ENUM: Record<string, AreaEnem> = {
  matematica: AreaEnem.MATEMATICA,
  linguagens: AreaEnem.LINGUAGENS,
  humanas: AreaEnem.HUMANAS,
  natureza: AreaEnem.NATUREZA,
};

export function prioridadeTrilha(
  autoAvaliacao: number,
  proficienciaReal: number,
  temProficiencia: boolean,
): number {
  const autoScore = (6 - autoAvaliacao) * 20;
  if (!temProficiencia) {
    return Math.round(autoScore);
  }
  return Math.round(0.45 * autoScore + 0.55 * (100 - proficienciaReal));
}

export function labelPrioridade(score: number): 'Alta' | 'Média' | 'Baixa' {
  if (score >= 60) return 'Alta';
  if (score >= 35) return 'Média';
  return 'Baixa';
}

export function montarEtapasArea(input: {
  slug: string;
  label: string;
  scoreCombinado: number;
  disciplinasFoco: string[];
  etapasConcluidas: Set<string>;
}): TrilhaEtapa[] {
  const foco = formatarListaAssuntos(input.disciplinasFoco.slice(0, 2));

  const etapas: TrilhaEtapa[] = [
    {
      id: `orientacao-${input.slug}`,
      ordem: 1,
      titulo: `Foco: ${foco}`,
      descricao: `Sua trilha em ${input.label} começa pelos assuntos que você marcou como fraqueza.`,
      tipo: 'orientacao',
      concluida: input.etapasConcluidas.has(`orientacao-${input.slug}`),
    },
    {
      id: `treino-${input.slug}`,
      ordem: 2,
      titulo: 'Treino guiado (5q)',
      descricao: `5 questões de ${input.label} com gabarito imediato — aqueça em ${foco}.`,
      tipo: 'treino',
      href: `/simulados/treino/novo?area=${input.slug}&quantidade=5`,
      concluida: input.etapasConcluidas.has(`treino-${input.slug}`),
    },
    {
      id: `modalidade-${input.slug}`,
      ordem: 3,
      titulo: 'Simulado da área (10q)',
      descricao: `Prova só de ${input.label} para medir se ${foco} já melhorou.`,
      tipo: 'modalidade',
      href: `/simulados/modalidade/novo?area=${input.slug}&quantidade=10`,
      concluida: input.etapasConcluidas.has(`modalidade-${input.slug}`),
    },
    {
      id: `revisao-${input.slug}`,
      ordem: 4,
      titulo: 'Revisar erros com IA',
      descricao: 'Abra o resultado, clique nos erros e peça explicação no tutor.',
      tipo: 'revisao',
      href: '/simulados',
      concluida: input.etapasConcluidas.has(`revisao-${input.slug}`),
    },
    {
      id: `tutor-${input.slug}`,
      ordem: 5,
      titulo: 'Plano com o tutor',
      descricao: `Peça um roteiro curto só para ${foco}.`,
      tipo: 'tutor',
      concluida: input.etapasConcluidas.has(`tutor-${input.slug}`),
    },
  ];

  // Área ainda crítica: inclui cronômetro depois do aquecimento.
  if (input.scoreCombinado >= 35) {
    etapas.push({
      id: `cronometrado-${input.slug}`,
      ordem: 6,
      titulo: 'Prova cronometrada',
      descricao: `10 questões de ${input.label} no ritmo de prova.`,
      tipo: 'cronometrado',
      href: `/simulados/cronometro/novo?area=${input.slug}&quantidade=10`,
      concluida: input.etapasConcluidas.has(`cronometrado-${input.slug}`),
    });
  }

  return etapas;
}

const ETAPA_ID_REGEX =
  /^(orientacao|treino|modalidade|revisao|tutor|cronometrado)-(matematica|linguagens|humanas|natureza)$/;

export function isEtapaIdValida(etapaId: string): boolean {
  return ETAPA_ID_REGEX.test(etapaId);
}

export function estadoTrilhaVazio(): TrilhaEstado {
  return {
    diagnostico: {
      completo: false,
      autoAvaliacao: {},
      disciplinasFracas: [],
    },
    etapasConcluidas: [],
  };
}

export function parseTrilhaEstado(raw: unknown): TrilhaEstado {
  if (!raw || typeof raw !== 'object') {
    return estadoTrilhaVazio();
  }

  const data = raw as Partial<TrilhaEstado>;
  const diagnostico = (data.diagnostico ?? {}) as Partial<TrilhaDiagnostico>;

  return {
    diagnostico: {
      completo: Boolean(diagnostico.completo),
      concluidoEm:
        typeof diagnostico.concluidoEm === 'string'
          ? diagnostico.concluidoEm
          : undefined,
      autoAvaliacao:
        diagnostico.autoAvaliacao &&
        typeof diagnostico.autoAvaliacao === 'object'
          ? (diagnostico.autoAvaliacao as Record<string, number>)
          : {},
      disciplinasFracas: Array.isArray(diagnostico.disciplinasFracas)
        ? diagnostico.disciplinasFracas.filter(
            (item): item is string => typeof item === 'string',
          )
        : [],
      metaEnem:
        typeof diagnostico.metaEnem === 'string'
          ? diagnostico.metaEnem
          : undefined,
    },
    etapasConcluidas: Array.isArray(data.etapasConcluidas)
      ? data.etapasConcluidas.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    checklistIa: Array.isArray(data.checklistIa)
      ? data.checklistIa
          .filter(
            (item): item is ChecklistItemIa =>
              Boolean(item) &&
              typeof item === 'object' &&
              typeof (item as ChecklistItemIa).id === 'string' &&
              typeof (item as ChecklistItemIa).texto === 'string',
          )
          .map((item) => ({
            id: item.id,
            texto: item.texto,
            concluida: Boolean(item.concluida),
            areaSlug:
              typeof item.areaSlug === 'string' ? item.areaSlug : undefined,
            assuntoId:
              typeof item.assuntoId === 'string' ? item.assuntoId : undefined,
            criadoEm:
              typeof item.criadoEm === 'string'
                ? item.criadoEm
                : new Date().toISOString(),
          }))
      : [],
    planoIa:
      data.planoIa &&
      typeof data.planoIa === 'object' &&
      typeof (data.planoIa as PlanoIa).metaSemanal === 'string'
        ? {
            atualizadoEm:
              typeof (data.planoIa as PlanoIa).atualizadoEm === 'string'
                ? (data.planoIa as PlanoIa).atualizadoEm
                : new Date().toISOString(),
            metaSemanal: (data.planoIa as PlanoIa).metaSemanal,
            proximoPasso:
              typeof (data.planoIa as PlanoIa).proximoPasso === 'string'
                ? (data.planoIa as PlanoIa).proximoPasso
                : '',
            areaSlug:
              typeof (data.planoIa as PlanoIa).areaSlug === 'string'
                ? (data.planoIa as PlanoIa).areaSlug
                : '',
            resumo:
              typeof (data.planoIa as PlanoIa).resumo === 'string'
                ? (data.planoIa as PlanoIa).resumo
                : undefined,
          }
        : undefined,
  };
}
