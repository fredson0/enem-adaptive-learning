/**
 * Tokens da animação de entrada da landing.
 * Documentação: docs/LANDING-ENTRANCE.md
 */

export const LANDING_ENTRANCE_STORAGE_KEY = "enem-landing-intro-v2";

export const LANDING_ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;

/** Durações em milissegundos */
export const LANDING_ENTRANCE_TIMINGS = {
  /** Fase 1 — "ENEM+" aparece centralizado */
  titleIn: 750,
  /** Fase 2 — título divide e imagem surge no centro */
  split: 950,
  /** Fase 3 — pausa com imagem visível */
  hold: 2000,
  /** Fase 4 — vídeo expande e empurra o título para os lados */
  expand: 2200,
  /** Fase 5 — overlay some e revela a hero montada por baixo */
  exit: 450,
} as const;

export const LANDING_ENTRANCE_COLORS = {
  background: "#e6e6e6",
  title: "#0b0b0b",
} as const;

/** Largura × altura do retângulo central (proporção ~4:3, altura alinhada ao título) */
export const LANDING_ENTRANCE_IMAGE = {
  width: "clamp(4.5rem, 14vw, 10rem)",
  height: "clamp(3.25rem, 10.5vw, 7.5rem)",
  /** Valores animáveis (Framer não interpola clamp) — colados ao título */
  animWidth: "14vw",
  animHeight: "10.5vw",
} as const;

export const LANDING_ENTRANCE_TITLE_CLASS =
  "font-display text-[clamp(3.75rem,18vw,11rem)] leading-[0.88] font-semibold tracking-[-0.05em]";
