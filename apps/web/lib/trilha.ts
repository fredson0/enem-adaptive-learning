import { apiFetch } from "@/lib/api";
import { recalcularTrilhaProgresso } from "@/lib/trilha-progresso";
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
  proximaEtapa: TrilhaEtapa | null;
  perguntaTutor: string;
};

export type LacunaDisciplinaTrilha = {
  disciplina: string;
  area: string;
  slug: AreaEnemSlug;
  label: string;
  erros: number;
  acertos: number;
  total: number;
  taxaErro: number;
  prioridade: "Alta" | "Média" | "Baixa";
  mensagem: string;
};

export type TrilhaResponse = {
  diagnosticoCompleto: boolean;
  metaEnem: string | null;
  metaSemanal: string;
  planoIa: PlanoIa | null;
  checklistIa: ChecklistItemIa[];
  progressoPorAssunto?: Record<string, number>;
  coberturaPorAssunto?: Record<
    string,
    { dominadas: number; disponiveis: number; tentadas: number; percentual: number }
  >;
  lacunasPorDisciplina?: LacunaDisciplinaTrilha[];
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
  return apiFetch<TrilhaResponse>("/metricas/trilha").then(
    recalcularTrilhaProgresso,
  );
}

export function salvarDiagnosticoTrilha(payload: SalvarDiagnosticoPayload) {
  return apiFetch<{ ok: boolean }>("/metricas/trilha/diagnostico", {
    method: "POST",
    body: payload,
  });
}

export function marcarEtapaTrilha(etapaId: string, concluida: boolean) {
  return apiFetch<{ ok: boolean; etapasConcluidas: string[] }>(
    "/metricas/trilha/etapas",
    {
      method: "POST",
      body: { etapaId, concluida },
    },
  );
}

export function marcarChecklistIa(itemId: string, concluida: boolean) {
  return apiFetch<{ ok: boolean; checklistIa: ChecklistItemIa[] }>(
    "/metricas/trilha/checklist",
    {
      method: "POST",
      body: { itemId, concluida },
    },
  );
}

/** "Filosofia", "Filosofia e Atualidades" */
export function formatarAssuntos(assuntos: string[]): string {
  if (assuntos.length === 0) return "os tópicos mais cobrados";
  if (assuntos.length === 1) return assuntos[0];
  if (assuntos.length === 2) return `${assuntos[0]} e ${assuntos[1]}`;
  return `${assuntos.slice(0, -1).join(", ")} e ${assuntos[assuntos.length - 1]}`;
}
