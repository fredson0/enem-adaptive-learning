/**
 * Framer Motion não interpola `opacity` se o valor inicial for `undefined`.
 * Isso acontece com `initial={false}` ou `animate={undefined}` quando o
 * elemento não tem opacity inline — o runtime lê o computed style e falha.
 */
export const MOTION_OPAQUE = { opacity: 1 as const };
export const MOTION_TRANSPARENT = { opacity: 0 as const };

export function motionRevealState(
  reduceMotion: boolean | null,
  inView: boolean,
  hidden: { y: number; opacity: number },
) {
  const skip = reduceMotion === true;
  const shown = { y: 0, opacity: 1 };
  return {
    initial: skip ? shown : hidden,
    animate: skip || inView ? shown : hidden,
  };
}
