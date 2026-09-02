"use client";

import { REVEAL_MOTION } from "@/lib/scroll-lenis-config";
import { MarketingLoopVideo } from "@/components/marketing/marketing-loop-video";
import { MARKETING_VIDEOS } from "@/lib/landing-hero-media";
import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Caveat } from "next/font/google";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const ETAPAS = [
  "Diagnóstico inicial",
  "Treino guiado",
  "Simulado focado",
  "Revisão de erros",
  "Tutor contextual",
  "Prova simulada",
];

function BlurReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { y: REVEAL_MOTION.y, opacity: 0 }}
      animate={
        isInView && !reduceMotion
          ? { y: 0, opacity: 1 }
          : reduceMotion
            ? undefined
            : {}
      }
      transition={{
        duration: REVEAL_MOTION.duration,
        delay,
        ease: REVEAL_MOTION.ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingTrilhaShowcase() {
  return (
    <section
      id="trilha"
      data-scroll-section
      className="relative overflow-hidden bg-white px-4 py-20 md:px-8 md:py-28"
    >
      <div className="relative mx-auto max-w-[1200px]">
        <BlurReveal className="mx-auto max-w-3xl text-center">
          <p
            className={cn(
              caveat.className,
              "text-xl text-[#7c6cff] sm:text-2xl",
            )}
          >
            Sua trilha
          </p>
          <h2 className="font-display mt-4 text-[clamp(2rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-[#0b1220]">
            Quatro áreas, um plano que evolui com você
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed md:text-base"
            style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
          >
            Após o diagnóstico, a plataforma ordena Linguagens, Matemática,
            Humanas e Natureza por prioridade — com etapas sequenciais e foco nas
            disciplinas onde você mais precisa evoluir.
          </p>
        </BlurReveal>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12">
          <BlurReveal delay={0.1}>
            <div className="space-y-4">
              <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
                ( Etapas )
              </p>
              <ol className="space-y-2.5">
                {ETAPAS.map((etapa, index) => (
                  <li
                    key={etapa}
                    className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-[#f3f3f1] px-4 py-3 text-sm text-[#0b1220]/80"
                  >
                    <span className="font-mono text-xs text-[#7c6cff]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {etapa}
                  </li>
                ))}
              </ol>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.16}>
            <div className="overflow-hidden rounded-[24px] border border-black/10 bg-[#0d0d0d] shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
              <div className="relative aspect-video">
                <MarketingLoopVideo src={MARKETING_VIDEOS.trilha} />
              </div>
            </div>
          </BlurReveal>
        </div>

        <BlurReveal delay={0.2} className="mt-10 text-center md:mt-12">
          <Link
            href="/trilha-personalizada"
            className="group inline-flex items-center gap-2 rounded-full bg-[#b0ff57] py-1 pr-1 pl-5 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
          >
            Conhecer a trilha
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
              <ArrowRight className="h-4 w-4 text-[#E1E0CC]" />
            </span>
          </Link>
        </BlurReveal>
      </div>
    </section>
  );
}
