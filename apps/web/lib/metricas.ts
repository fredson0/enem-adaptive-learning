import { apiFetch } from "@/lib/api";
import type { AreaEnemSlug } from "@/lib/simulados";

export type ProficienciaArea = {
  area: string;
  slug: string;
  label: string;
  score: number;
  totalQuestoes: number;
  acertos: number;
  atualizadoEm: string | null;
};

export type ProficienciaResponse = {
  areas: ProficienciaArea[];
  resumo: {
    simuladosConcluidos: number;
    questoesRespondidas: number;
    mediaGeralPercentual: number | null;
  };
  ultimoSimulado: {
    id: string;
    area: string | null;
    slug: string | null;
    label: string | null;
    acertos: number;
    totalQuestoes: number;
    percentual: number;
    finalizadoEm: string | null;
  } | null;
};

export type PontoEvolucao = {
  simuladoId: string;
  area: string | null;
  slug: string | null;
  label: string | null;
  acertos: number;
  totalQuestoes: number;
  percentual: number;
  finalizadoEm: string;
};

export type LacunaTrilha = {
  area: string;
  slug: string;
  label: string;
  score: number;
  totalQuestoes: number;
  acertos: number;
  prioridade: "Alta" | "Média" | "Baixa";
  mensagem: string;
  simuladoSugerido: {
    area: AreaEnemSlug;
    quantidade: number;
  };
  perguntaTutor: string;
};

export type LacunaDisciplina = {
  disciplina: string;
  area: string;
  slug: string;
  label: string;
  erros: number;
  acertos: number;
  total: number;
  taxaErro: number;
  prioridade: "Alta" | "Média" | "Baixa";
  mensagem: string;
};

export type LacunasResponse = {
  metaSemanal: string;
  lacunas: LacunaTrilha[];
  disciplinas: LacunaDisciplina[];
  checklist: {
    id: string;
    texto: string;
    concluido: boolean;
  }[];
  planoIa?: import("@/lib/trilha").PlanoIa | null;
};

export type CoberturaResumo = {
  dominadas: number;
  disponiveis: number;
  tentadas: number;
  percentual: number;
};

export type CoberturaArea = CoberturaResumo & {
  area: string;
  slug: string;
  label: string;
  score: number;
};

export type CoberturaAssunto = CoberturaResumo & {
  assuntoId: string;
  nome: string;
  areaSlug: string;
};

export type CoberturaAno = CoberturaResumo & {
  ano: number;
  completo: boolean;
};

export type CoberturaResponse = {
  areas: CoberturaArea[];
  assuntos: CoberturaAssunto[];
  anos: CoberturaAno[];
  progressoPorAssunto: Record<string, number>;
  coberturaPorAssunto: Record<string, CoberturaResumo>;
};

export function fetchCobertura() {
  return apiFetch<CoberturaResponse>("/metricas/cobertura");
}

export function fetchProficiencia() {
  return apiFetch<ProficienciaResponse>("/metricas/proficiencia");
}

export function fetchEvolucao() {
  return apiFetch<{ pontos: PontoEvolucao[] }>("/metricas/evolucao");
}

export function fetchLacunas() {
  return apiFetch<LacunasResponse>("/metricas/lacunas");
}
