import type { ModoSimuladoSlug } from "@/lib/simulado-modos";
import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";

/** Azul de destaque — terceiro modo (cronômetro), alinhado à paleta ENEM+. */
const ACCENT_BLUE = "#60a5fa";

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
      gradient: "from-[#4a6b1f] via-[#1a2a0e] to-[#0a0a0a]",
      glow: "radial-gradient(circle at 30% 20%, rgba(176,255,87,0.38), transparent 55%)",
      accent: MARKETING_OSMO_COLORS.accentLime,
      frame: "#1a2214",
    },
    modalidade: {
      coverLabel: "Foco",
      gradient: "from-[#5a4dcc] via-[#2a2060] to-[#0a0a0a]",
      glow: "radial-gradient(circle at 70% 25%, rgba(124,108,255,0.42), transparent 50%)",
      accent: MARKETING_OSMO_COLORS.accentPurple,
      frame: "#1a1628",
    },
    cronometrado: {
      coverLabel: "Tempo",
      gradient: "from-[#1e3a8a] via-[#0f172a] to-[#0a0a0a]",
      glow: "radial-gradient(circle at 50% 80%, rgba(96,165,250,0.35), transparent 45%)",
      accent: ACCENT_BLUE,
      frame: "#141a24",
    },
  };
