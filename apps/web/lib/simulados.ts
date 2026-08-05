export type AreaEnemSlug = 'linguagens' | 'humanas' | 'natureza' | 'matematica';

export const AREA_OPTIONS: { value: AreaEnemSlug; label: string }[] = [
  { value: 'linguagens', label: 'Linguagens' },
  { value: 'humanas', label: 'Ciências Humanas' },
  { value: 'natureza', label: 'Ciências da Natureza' },
  { value: 'matematica', label: 'Matemática' },
];

export const QUANTIDADE_OPTIONS = [5, 10, 20] as const;

export type SimuladoResumo = {
  id: string;
  area: string | null;
  totalQuestoes: number;
  respondidas: number;
  acertos: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO';
  iniciadoEm: string;
  finalizadoEm: string | null;
};

export type AlternativaQuestao = {
  letra: string;
  texto: string;
};

export type QuestaoPublica = {
  id: string;
  ano: number;
  area: string;
  indice: number;
  contexto: string;
  introducaoAlternativas: string | null;
  alternativas: AlternativaQuestao[];
  imagemUrl: string | null;
};

export type SimuladoDetalhe = {
  id: string;
  area: string | null;
  totalQuestoes: number;
  respondidas: number;
  acertos: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO';
  questaoAtualIdx: number;
  iniciadoEm: string;
  finalizadoEm: string | null;
  concluido: boolean;
  questaoAtual: QuestaoPublica | null;
  respostas: {
    questaoId: string;
    alternativa: string;
    correto: boolean;
    respondidoEm: string;
  }[];
};

export type SimuladoResultado = {
  id: string;
  area: string | null;
  totalQuestoes: number;
  respondidas: number;
  acertos: number;
  status: string;
  iniciadoEm: string;
  finalizadoEm: string | null;
  questoes: (QuestaoPublica & {
    gabarito: string;
    alternativaMarcada: string | null;
    correto: boolean | null;
  })[];
};

export function formatArea(area: string | null) {
  if (!area) return 'Geral';
  const found = AREA_OPTIONS.find(
    (o) => o.value === area.toLowerCase() || o.label === area,
  );
  if (found) return found.label;
  const map: Record<string, string> = {
    LINGUAGENS: 'Linguagens',
    HUMANAS: 'Ciências Humanas',
    NATUREZA: 'Ciências da Natureza',
    MATEMATICA: 'Matemática',
  };
  return map[area] ?? area;
}

export function formatSimuladoStatus(status: string) {
  return status === 'CONCLUIDO' ? 'Concluído' : 'Em andamento';
}
