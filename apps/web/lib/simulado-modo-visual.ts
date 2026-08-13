import type { ModoSimuladoSlug } from "@/lib/simulado-modos";

export type SimuladoModoVisual = {
  /** Palavra decorativa na capa (opcional) */
  coverLabel: string;
  gradient: string;
  glow: string;
  accent: string;
  /** Cor da moldura do card — estilo Osmo */
  frame: string;
};

export const SIMULADO_MODO_VISUAL: Record<ModoSimuladoSlug, SimuladoModoVisual> =
  {
    treino: {
      coverLabel: "Livre",
      gradient: "from-[#1a2e14] via-[#0f1a0c] to-[#0a0a0a]",
      glow: "radial-gradient(circle at 30% 20%, rgba(176,255,87,0.22), transparent 55%)",
      accent: "#b0ff57",
      frame: "#1a1814",
    },
    modalidade: {
      coverLabel: "Foco",
      gradient: "from-[#2a1f5c] via-[#14102a] to-[#0a0a0a]",
      glow: "radial-gradient(circle at 70% 25%, rgba(91,77,255,0.35), transparent 50%)",
      accent: "#5b4dff",
      frame: "#18141f",
    },
    cronometrado: {
      coverLabel: "Tempo",
      gradient: "from-[#3a2810] via-[#1a1208] to-[#0a0a0a]",
      glow: "radial-gradient(circle at 50% 80%, rgba(251,191,36,0.18), transparent 45%)",
      accent: "#fbbf24",
      frame: "#1c1610",
    },
  };
