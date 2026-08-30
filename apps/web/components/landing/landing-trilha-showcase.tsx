"use client";

import { GlareCard } from "@/components/ui/glare-cards";
import { REVEAL_MOTION } from "@/lib/scroll-lenis-config";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Route } from "lucide-react";
import { Caveat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const TRILHA_AREAS = [
  {
    slug: "linguagens",
    label: "Linguagens",
    foco: "Interpretação · Literatura · Gramática",
    gradient: "from-[#3a1a2a] via-[#2a1824] to-[#141014]",
  },
  {
    slug: "matematica",
    label: "Matemática",
    foco: "Funções · Geometria · Probabilidade",
    gradient: "from-[#1a2a4a] via-[#1e2438] to-[#12141c]",
  },
  {
    slug: "humanas",
    label: "Humanas",
    foco: "História · Geografia · Sociologia",
    gradient: "from-[#3a2a10] via-[#2a2210] to-[#141210]",
  },
  {
    slug: "natureza",
    label: "Natureza",
    foco: "Física · Química · Biologia",
    gradient: "from-[#103a2a] via-[#142a22] to-[#101614]",
  },
] as const;

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

function MarketingAreaCard({
  area,
}: {
  area: (typeof TRILHA_AREAS)[number];
}) {
  return (
    <div className="w-[min(78vw,260px)] shrink-0 snap-start sm:w-[280px]">
      <GlareCard
        tiltIntensity={9}
        glareColor="rgba(176,255,87,0.18)"
        className="h-full overflow-hidden border-white/[0.08] bg-[#1e1d1b] p-0"
      >
        <div
          className={cn(
            "flex min-h-[210px] flex-col justify-between bg-gradient-to-br p-5",
            area.gradient,
          )}
        >
          <Route className="size-5 text-[#b0ff57]" strokeWidth={1.75} />
          <div>
            <p className="text-lg font-medium text-white">{area.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">
              {area.foco}
            </p>
          </div>
        </div>
      </GlareCard>
    </div>
  );
}

export function LandingTrilhaShowcase() {
  return (
    <section
      id="trilha"
      data-scroll-section
      className="relative overflow-hidden px-4 py-20 md:px-8 md:py-28"
      style={{ backgroundColor: MARKETING_OSMO_COLORS.osmoCanvas }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(104,64,255,0.12),transparent_42%)]" />

      <div className="relative mx-auto max-w-[1200px]">
        <BlurReveal className="mx-auto max-w-3xl text-center">
          <p
            className={cn(
              caveat.className,
              "text-xl text-[#b0ff57] sm:text-2xl",
            )}
          >
            Sua trilha
          </p>
          <h2 className="font-display mt-4 text-[clamp(2rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-white">
            Quatro áreas, um plano que evolui com você
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            Após o diagnóstico, a plataforma ordena Linguagens, Matemática,
            Humanas e Natureza por prioridade — com etapas sequenciais e foco nas
            disciplinas onde você mais precisa evoluir.
          </p>
        </BlurReveal>

        <BlurReveal delay={0.1} className="mt-10 md:mt-14">
          <div className="flex gap-4 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
            {TRILHA_AREAS.map((area) => (
              <MarketingAreaCard key={area.slug} area={area} />
            ))}
          </div>
        </BlurReveal>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12">
          <BlurReveal delay={0.14}>
            <div className="space-y-4">
              <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
                ( Etapas )
              </p>
              <ol className="space-y-2.5">
                {ETAPAS.map((etapa, index) => (
                  <li
                    key={etapa}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                  >
                    <span className="font-mono text-xs text-[#b0ff57]/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {etapa}
                  </li>
                ))}
              </ol>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#1e1d1b] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-[4/3]">
                <Image
                  src={MARKETING_IMAGES.trilhaAreas}
                  alt="Trilha personalizada por área do ENEM"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </BlurReveal>
        </div>

        <BlurReveal delay={0.24} className="mt-10 text-center md:mt-12">
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
