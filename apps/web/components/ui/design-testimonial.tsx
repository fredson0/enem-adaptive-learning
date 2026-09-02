"use client";

import { MarketingClipTitle } from "@/components/marketing/marketing-clip-title";
import { MARKETING_OSMO_COLORS, MARKETING_OSMO_SECTION_TITLE } from "@/lib/marketing-osmo-tokens";
import { motionRevealState } from "@/lib/motion-reveal";
import { cn } from "@/lib/utils";
import { MOCK_TESTIMONIALS } from "@/lib/testimonials";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export type DesignTestimonialItem = {
  quote: string;
  author: string;
  role: string;
};

const DEFAULT_TESTIMONIALS = MOCK_TESTIMONIALS;

export type DesignTestimonialProps = {
  eyebrow?: string;
  title?: string;
  testimonials?: DesignTestimonialItem[];
  className?: string;
  id?: string;
  autoAdvanceMs?: number;
};

export function DesignTestimonial({
  eyebrow = "Depoimentos",
  title = "Quem usa, sente a diferença",
  testimonials = DEFAULT_TESTIMONIALS,
  className,
  id = "depoimentos",
  autoAdvanceMs = 6000,
}: DesignTestimonialProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "0px 0px -8% 0px" });
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  const numberX = useTransform(x, [-200, 200], [-16, 16]);
  const numberY = useTransform(y, [-200, 200], [-8, 8]);

  const goNext = useCallback(
    () => setActiveIndex((prev) => (prev + 1) % testimonials.length),
    [testimonials.length],
  );

  const goPrev = useCallback(
    () =>
      setActiveIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length,
      ),
    [testimonials.length],
  );

  useEffect(() => {
    if (reduceMotion || testimonials.length <= 1) return;

    const timer = setInterval(goNext, autoAdvanceMs);
    return () => clearInterval(timer);
  }, [autoAdvanceMs, goNext, reduceMotion, testimonials.length]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const current = testimonials[activeIndex];
  const headingReveal = motionRevealState(reduceMotion, isInView, {
    y: 24,
    opacity: 0,
  });
  const labelReveal = motionRevealState(reduceMotion, isInView, {
    y: 0,
    opacity: 0,
  });

  return (
    <section
      ref={sectionRef}
      id={id}
      data-scroll-section
      className={cn(
        "overflow-hidden bg-white px-4 py-20 md:px-8 md:py-28",
        className,
      )}
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <MarketingClipTitle
            as="h2"
            className={cn(
              "font-display text-[#0b1220]",
              MARKETING_OSMO_SECTION_TITLE,
            )}
          >
            {eyebrow}
          </MarketingClipTitle>
          <motion.p
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
            initial={headingReveal.initial}
            animate={headingReveal.animate}
            transition={{ duration: 0.7, ease: REVEAL_EASE }}
          >
            {title}
          </motion.p>
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto mt-12 max-w-5xl md:mt-16"
          onMouseMove={handleMouseMove}
        >
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:gap-0">
            {/* Coluna esquerda — rótulo vertical + progresso */}
            <div className="hidden flex-col items-center justify-center border-r border-black/[0.08] pr-10 md:flex">
              <motion.span
                className="font-mono text-xs tracking-[0.2em] text-[#0b1220]/40 uppercase"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                initial={labelReveal.initial}
                animate={labelReveal.animate}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                {eyebrow}
              </motion.span>

              <div className="relative mt-8 h-28 w-px bg-black/[0.08]">
                <motion.div
                  className="absolute top-0 left-0 w-full origin-top bg-[#0b1220]"
                  animate={{
                    height: `${((activeIndex + 1) / testimonials.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: REVEAL_EASE }}
                />
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 md:pl-12">
              <div className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-transparent p-6 md:p-10">
                {/* Número grande atrás do card */}
                <motion.div
                  className="pointer-events-none absolute -top-8 -left-4 z-0 font-display text-[clamp(9rem,26vw,20rem)] leading-none font-semibold tracking-tighter text-[#0b1220]/[0.12] select-none md:-left-8 md:-top-12"
                  style={reduceMotion ? undefined : { x: numberX, y: numberY }}
                  aria-hidden
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeIndex}
                      initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
                      transition={{ duration: 0.55, ease: REVEAL_EASE }}
                      className="block"
                    >
                      {String(activeIndex + 1).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.35, ease: REVEAL_EASE }}
                    className="mb-6"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/30 px-3 py-1 font-mono text-xs text-[#0b1220]/55">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: MARKETING_OSMO_COLORS.accentPurple }}
                      />
                      {current.role}
                    </span>
                  </motion.div>
                </AnimatePresence>

                <div className="relative mb-10 min-h-[120px] md:min-h-[160px]">
                  <AnimatePresence mode="wait">
                    <motion.blockquote
                      key={activeIndex}
                      className="font-display text-[clamp(1.35rem,3.2vw,2.35rem)] leading-[1.2] font-medium tracking-[-0.03em] text-[#0b1220]"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {current.quote.split(" ").map((word, index) => (
                        <motion.span
                          key={`${activeIndex}-${index}`}
                          className="mr-[0.28em] inline-block"
                          variants={
                            reduceMotion
                              ? {
                                  hidden: { opacity: 0 },
                                  visible: { opacity: 1 },
                                  exit: { opacity: 0 },
                                }
                              : {
                                  hidden: { opacity: 0, y: 16 },
                                  visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                      duration: 0.45,
                                      delay: index * 0.035,
                                      ease: REVEAL_EASE,
                                    },
                                  },
                                  exit: {
                                    opacity: 0,
                                    y: -8,
                                    transition: {
                                      duration: 0.15,
                                      delay: index * 0.015,
                                    },
                                  },
                                }
                          }
                        >
                          {word}
                        </motion.span>
                      ))}
                    </motion.blockquote>
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-6 border-t border-black/[0.04] pt-6 sm:flex-row sm:items-end sm:justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <motion.div
                        className="h-px w-8 bg-[#0b1220]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{ originX: 0 }}
                      />
                      <div>
                        <p className="text-base font-semibold text-[#0b1220]">
                          {current.author}
                        </p>
                        <p className="mt-0.5 text-sm text-[#0b1220]/45 md:hidden">
                          {current.role}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center gap-2 md:hidden">
                      {testimonials.map((item, index) => (
                        <button
                          key={item.author}
                          type="button"
                          aria-label={`Depoimento ${index + 1}`}
                          onClick={() => setActiveIndex(index)}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            index === activeIndex
                              ? "w-6 bg-[#0b1220]"
                              : "w-1.5 bg-[#0b1220]/20",
                          )}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        aria-label="Depoimento anterior"
                        onClick={goPrev}
                        className="group relative flex size-11 items-center justify-center overflow-hidden rounded-full border border-black/[0.06] bg-white/35 backdrop-blur-sm"
                        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-[#0b1220]/90"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3, ease: REVEAL_EASE }}
                        />
                        <ChevronLeft
                          className="relative z-10 size-4 text-[#0b1220] transition-colors group-hover:text-white"
                          strokeWidth={1.5}
                        />
                      </motion.button>

                      <motion.button
                        type="button"
                        aria-label="Próximo depoimento"
                        onClick={goNext}
                        className="group relative flex size-11 items-center justify-center overflow-hidden rounded-full border border-black/[0.06] bg-white/35 backdrop-blur-sm"
                        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-[#0b1220]/90"
                          initial={{ x: "100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3, ease: REVEAL_EASE }}
                        />
                        <ChevronRight
                          className="relative z-10 size-4 text-[#0b1220] transition-colors group-hover:text-white"
                          strokeWidth={1.5}
                        />
                      </motion.button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
