"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import {
  LANDING_HERO_VIDEO_URL,
  subscribeLandingHeroVideoHandoff,
} from "@/lib/landing-hero-media";
import { cn } from "@/lib/utils";

const HERO_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const heroRevealTransition = (delay = 0): Transition => ({
  duration: 1,
  delay,
  ease: HERO_REVEAL_EASE,
});

function HeroBlurReveal({
  children,
  delay = 0,
  className,
  play = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  play?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ y: 72, opacity: 0, filter: "blur(16px)" }}
      animate={
        play
          ? { y: 0, opacity: 1, filter: "blur(0px)" }
          : { y: 72, opacity: 0, filter: "blur(16px)" }
      }
      transition={heroRevealTransition(delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
  playOnMount?: boolean;
  play?: boolean;
  baseDelay?: number;
}

export const WordsPullUp = ({
  text,
  className = "",
  showAsterisk = false,
  style,
  playOnMount = false,
  play,
  baseDelay = 0,
}: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const shouldAnimate = play ?? (playOnMount || isInView);
  const words = text.split(" ");

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      style={style}
    >
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={
              reduceMotion
                ? false
                : { y: 72, opacity: 0, filter: "blur(16px)" }
            }
            animate={
              shouldAnimate && !reduceMotion
                ? { y: 0, opacity: 1, filter: "blur(0px)" }
                : reduceMotion
                  ? undefined
                  : { y: 72, opacity: 0, filter: "blur(16px)" }
            }
            transition={heroRevealTransition(baseDelay + i * 0.06)}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">
                *
              </span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: CSSProperties;
}

export const WordsPullUpMultiStyle = ({
  segments,
  className = "",
  style,
}: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap justify-center ${className}`}
      style={style}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={
            reduceMotion ? false : { y: 72, opacity: 0, filter: "blur(16px)" }
          }
          animate={
            isInView && !reduceMotion
              ? { y: 0, opacity: 1, filter: "blur(0px)" }
              : reduceMotion
                ? undefined
                : {}
          }
          transition={heroRevealTransition(i * 0.06)}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ENEM+ ---------------- */
const HERO_BLEED = "clamp(4.5rem, 12vh, 9rem)";

function EnemHero({ revealed = true }: { revealed?: boolean }) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return subscribeLandingHeroVideoHandoff((time) => {
      const video = heroVideoRef.current;
      if (!video) return;

      const applyTime = () => {
        try {
          video.currentTime = time;
        } catch {
          /* ignore seek errors during load */
        }
      };

      if (video.readyState >= 1) {
        applyTime();
      } else {
        video.addEventListener("loadedmetadata", applyTime, { once: true });
      }
    });
  }, []);

  return (
    <section
      className="relative w-full"
      style={{ height: `calc(100svh + ${HERO_BLEED})` }}
    >
      <div className="absolute inset-x-0 top-0 h-svh overflow-hidden">
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          src={LANDING_HERO_VIDEO_URL}
          aria-hidden
        />

        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/85" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#151314] to-[#151314]"
        style={{ height: HERO_BLEED }}
        aria-hidden
      />

      <motion.div
        className={cn(
          "absolute right-0 left-0 px-4 pb-8 sm:px-6 md:px-10 md:pb-10",
          !revealed && "pointer-events-none",
        )}
        style={{ bottom: HERO_BLEED }}
        initial={false}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: revealed ? 0.2 : 0 }}
      >
        <div className="grid grid-cols-12 items-end gap-4">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="font-display text-[22vw] leading-[0.85] font-normal tracking-[-0.06em] text-[#E1E0CC] sm:text-[20vw] md:text-[18vw] lg:text-[16vw] xl:text-[14vw]">
              <WordsPullUp text="ENEM+" showAsterisk play={revealed} />
            </h1>
          </div>

          <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-4 lg:pb-6">
            <HeroBlurReveal delay={0.18} play={revealed}>
              <p className="max-w-sm text-xs leading-snug text-[#E1E0CC]/75 sm:text-sm md:text-base">
                Sua preparação adaptativa para o ENEM — simulados, tutor IA e
                métricas ajustados ao que você ainda precisa dominar.
              </p>
            </HeroBlurReveal>

            <HeroBlurReveal delay={0.32} play={revealed}>
              <Link
                href="/tutor"
                className="group inline-flex items-center gap-2 self-start rounded-full bg-[#b0ff57] py-1 pr-1 pl-5 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
              >
                Começar agora
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 text-[#E1E0CC]" />
                </span>
              </Link>
            </HeroBlurReveal>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export { EnemHero, EnemHero as PrismaHero };
