/**
 * Tokens do padrão visual Osmo — páginas de marketing (landing / como funciona).
 * Documentação: docs/MARKETING-UI-OSMO.md
 */

export const MARKETING_OSMO_COLORS = {
  heroBg: "#111111",
  sectionBg: "#f3f3f1",
  titleDark: "#0b1220",
  accentLime: "#b0ff57",
  accentPurple: "#7c6cff",
  ctaCardBg: "#212121",
  ctaButton: "#6840ff",
  ctaButtonHover: "#5a36e0",
  textMuted: "rgba(255,255,255,0.55)",
  textMutedDark: "rgba(11,18,32,0.65)",
} as const;

/** Hero — título principal (ex.: "Como funciona") */
export const MARKETING_OSMO_HERO_TITLE =
  "text-[clamp(3.5rem,14vw,9.5rem)] leading-[0.88] font-semibold tracking-[-0.06em]";

/** Espaço acima do título para revelar a rodinha */
export const MARKETING_OSMO_HERO_TITLE_OFFSET =
  "pt-[clamp(9rem,22vw,15rem)] md:pt-[clamp(11rem,24vw,17rem)]";

/** Hero claro (ex.: /precos) — título mais alto para caber no viewport */
export const MARKETING_OSMO_HERO_TITLE_OFFSET_LIGHT =
  "pt-[clamp(4.5rem,12vw,8rem)] md:pt-[clamp(5rem,14vw,9rem)]";

/** Rodinha — tamanho do mostrador */
export const MARKETING_OSMO_DIAL_SIZE =
  "w-[min(108vw,52rem)]";

/** Rodinha — animação de entrada (mount / F5) */
export const MARKETING_OSMO_DIAL_SPIN = {
  fromRotate: -540,
  duration: 2.6,
  ease: [0.22, 1, 0.36, 1] as const,
} as const;

/** Seção clara — título de bloco (estilo "Features" Osmo) */
export const MARKETING_OSMO_SECTION_TITLE =
  "text-[clamp(3rem,10vw,7.5rem)] leading-[0.92] font-semibold tracking-[-0.05em]";

/** Sticky features — título de cada passo */
export const MARKETING_OSMO_FEATURE_TITLE =
  "text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.04em]";

/** Sticky features — altura de cada painel de scroll */
export const MARKETING_OSMO_FEATURE_PANEL_HEIGHT = "min-h-[85vh] lg:min-h-screen";

/** Screenshots do produto — proporção real dos exports (~1600×762) */
export const MARKETING_SCREENSHOT_ASPECT = "aspect-[1600/762]";

export const MARKETING_SCREENSHOT_FRAME =
  "relative mx-auto aspect-[1600/762] w-full overflow-hidden rounded-2xl border border-black/10 shadow-[0_32px_80px_rgba(0,0,0,0.12)] md:rounded-3xl";

export const MARKETING_SCREENSHOT_IMAGE_CLASS = "object-cover object-top";

export const MARKETING_SCREENSHOT_IMAGE_QUALITY = 92;

export const MARKETING_SCREENSHOT_IMAGE_SIZES =
  "(max-width: 1024px) 100vw, (max-width: 1536px) 55vw, 720px";
