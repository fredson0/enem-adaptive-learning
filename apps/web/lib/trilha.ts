import { apiFetch } from "@/lib/api";
import type { AreaEnemSlug } from "@/lib/simulados";

export type TrilhaEtapaTipo =
  | "orientacao"
  | "treino"
  | "modalidade"
  | "revisao"
  | "tutor"
  | "cronometrado";

export type TrilhaEtapa = {
  id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  tipo: TrilhaEtapaTipo;
  href?: string;
  concluida: boolean;
};

export type TrilhaArea = {
  area: string;
  slug: AreaEnemSlug;
  label: string;
  prioridade: "Alta" | "Média" | "Baixa";
  scoreCombinado: number;
  proficienciaReal: number;
  autoAvaliacao: number;
  totalQuestoes: number;
  disciplinasSugeridas: string[];
  progresso: number;
  etapas: TrilhaEtapa[];
  perguntaTutor: string;
};

export type TrilhaResponse = {
  diagnosticoCompleto: boolean;
  metaEnem: string | null;
  metaSemanal: string;
  tempoDiarioMinutos: number;
  areas: TrilhaArea[];
  areaPrioritaria: AreaEnemSlug | null;
};

export type SalvarDiagnosticoPayload = {
  autoAvaliacao: Record<AreaEnemSlug, number>;
  disciplinasFracas: string[];
  metaEnem?: string;
};

export function fetchTrilha() {
  return apiFetch<TrilhaResponse>("/metricas/trilha");
}

export function salvarDiagnosticoTrilha(payload: SalvarDiagnosticoPayload) {
  return apiFetch<{ ok: boolean }>("/metricas/trilha/diagnostico", {
    method: "POST",
    body: payload,
  });
}
