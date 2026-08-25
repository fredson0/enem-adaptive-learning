/**
 * Configuração Lenis no estilo Osmo / Dennis Snellenberg:
 * - scroll suave com inércia (não scroll nativo)
 * - GSAP ticker dirige o raf do Lenis (um único loop)
 * - ScrollTrigger lê a posição do Lenis via scrollerProxy
 *
 * Referência: https://github.com/darkroomengineering/lenis#gsap-scrolltrigger
 */

/** Easing exponencial — sensação “premium” do scroll Osmo */
export const LENIS_EASING = (t: number) =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t));

export const LENIS_OPTIONS = {
  duration: 1.15,
  easing: LENIS_EASING,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  /** Touch nativo no mobile evita sensação de atraso */
  syncTouch: false,
} as const;

export const REVEAL_MOTION = {
  y: 40,
  duration: 0.85,
  ease: [0.22, 1, 0.36, 1] as const,
} as const;
