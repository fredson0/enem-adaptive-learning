/**
 * Tokens da animação de entrada da landing.
 * Documentação: docs/LANDING-ENTRANCE.md
 */

export const LANDING_ENTRANCE_STORAGE_KEY = "enem-landing-intro-v2";

/** @deprecated legado — removido do sessionStorage; intro reinicia a cada F5 */
export const LANDING_ENTRANCE_LEGACY_STORAGE_KEY = LANDING_ENTRANCE_STORAGE_KEY;

export const LANDING_ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Expansão do vídeo — ease-in-out suave (sem pico no início).
 * O easeOut agressivo da intro fazia o retângulo “pular” e tremer nas bordas.
 */
export const LANDING_ENTRANCE_EXPAND_EASE = [0.4, 0.0, 0.18, 1] as const;

/** Durações em milissegundos */
export const LANDING_ENTRANCE_TIMINGS = {
  /** Fase 1 — "ENEM+IA" aparece centralizado */
  titleIn: 750,
  /** Fase 2 — título divide e imagem surge no centro */
  split: 950,
  /** Fase 3 — pausa com imagem visível */
  hold: 2000,
  /** Fase 4 — retângulo cresce até a viewport via scale (GPU) */
  expand: 2400,
  /** Fase 5 — overlay some e revela a hero montada por baixo */
  exit: 450,
  /** Atraso após o expand antes de revelar header e textos da hero */
  heroRevealDelay: 120,
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
  animWidthVw: 14,
  animHeightVw: 10.5,
  radius: 12,
} as const;

export const LANDING_ENTRANCE_TITLE_CLASS =
  "font-display text-[clamp(2.85rem,14vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.05em]";
