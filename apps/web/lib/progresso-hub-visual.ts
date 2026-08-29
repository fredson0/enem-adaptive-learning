import {
  SIMULADO_MODO_VISUAL,
  type SimuladoModoVisual,
} from "@/lib/simulado-modo-visual";

export type ProgressoHubCardId = "desempenho" | "rotina" | "foco";

/** Mesma paleta dos cards de simulado (Livre · Foco · Tempo), na mesma ordem visual. */
export const PROGRESSO_HUB_VISUAL: Record<
  ProgressoHubCardId,
  SimuladoModoVisual
> = {
  desempenho: SIMULADO_MODO_VISUAL.treino,
  rotina: SIMULADO_MODO_VISUAL.modalidade,
  foco: SIMULADO_MODO_VISUAL.cronometrado,
};
