import { AreaEnem } from '@generated/prisma';

export type TrilhaDiagnostico = {
  completo: boolean;
  concluidoEm?: string;
  autoAvaliacao: Record<string, number>;
  disciplinasFracas: string[];
  metaEnem?: string;
};

export type TrilhaEstado = {
  diagnostico: TrilhaDiagnostico;
  etapasConcluidas: string[];
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

export const DISCIPLINAS_POR_AREA: Record<string, string[]> = {
  matematica: ['Funções', 'Geometria', 'Probabilidade', 'Porcentagem'],
  linguagens: [
    'Interpretação de texto',
    'Literatura',
    'Gramática',
    'Gêneros textuais',
  ],
  humanas: ['História', 'Geografia', 'Sociologia', 'Filosofia'],
  natureza: ['Física', 'Química', 'Biologia', 'Ecologia'],
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
  const foco =
    input.disciplinasFoco.length > 0
      ? input.disciplinasFoco.slice(0, 2).join(' e ')
      : 'os tópicos mais cobrados';

  const etapas: TrilhaEtapa[] = [
    {
      id: `orientacao-${input.slug}`,
      ordem: 1,
      titulo: 'Entender sua lacuna',
      descricao: `Priorize ${foco} em ${input.label}.`,
      tipo: 'orientacao',
      concluida: input.etapasConcluidas.has(`orientacao-${input.slug}`),
    },
    {
      id: `treino-${input.slug}`,
      ordem: 2,
      titulo: 'Treino guiado',
      descricao: '5 questões com gabarito imediato para aquecer.',
      tipo: 'treino',
      href: `/simulados/treino/novo?area=${input.slug}&quantidade=5`,
      concluida: input.etapasConcluidas.has(`treino-${input.slug}`),
    },
    {
      id: `modalidade-${input.slug}`,
      ordem: 3,
      titulo: 'Simulado focado',
      descricao: `10 questões só de ${input.label}.`,
      tipo: 'modalidade',
      href: `/simulados/modalidade/novo?area=${input.slug}&quantidade=10`,
      concluida: input.etapasConcluidas.has(`modalidade-${input.slug}`),
    },
    {
      id: `revisao-${input.slug}`,
      ordem: 4,
      titulo: 'Revisar erros',
      descricao: 'Veja o que errou e peça explicação com IA.',
      tipo: 'revisao',
      href: '/simulados',
      concluida: input.etapasConcluidas.has(`revisao-${input.slug}`),
    },
    {
      id: `tutor-${input.slug}`,
      ordem: 5,
      titulo: 'Tirar dúvida com o tutor',
      descricao: `Pergunte sobre ${foco}.`,
      tipo: 'tutor',
      concluida: input.etapasConcluidas.has(`tutor-${input.slug}`),
    },
  ];

  if (input.scoreCombinado < 50) {
    return etapas.slice(0, 4);
  }

  etapas.push({
    id: `cronometrado-${input.slug}`,
    ordem: 6,
    titulo: 'Prova simulada',
    descricao: '10 questões com cronômetro — gabarito só no final.',
    tipo: 'cronometrado',
    href: `/simulados/cronometrado/novo?area=${input.slug}&quantidade=10`,
    concluida: input.etapasConcluidas.has(`cronometrado-${input.slug}`),
  });

  return etapas;
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
  };
}
