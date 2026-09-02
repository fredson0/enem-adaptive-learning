"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingClipTitle } from "@/components/marketing/marketing-clip-title";
import { MarketingLoopVideo } from "@/components/marketing/marketing-loop-video";
import { MARKETING_VIDEOS } from "@/lib/landing-hero-media";
import {
  MARKETING_OSMO_HERO_TITLE,
  MARKETING_OSMO_HERO_TITLE_OFFSET,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { Check, Play } from "lucide-react";
import { Caveat } from "next/font/google";
import { OsmoDialSpin, MARKETING_OSMO_DIAL_SIZE } from "@/components/marketing/osmo-dial";
import { useReducedMotion } from "framer-motion";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const COMO_FUNCIONA_VIDEO_SRC = MARKETING_VIDEOS.simulados;

type ComoFuncionaOsmoHeroProps = {
  title?: string;
  description?: string;
  accent?: string;
};

export function ComoFuncionaOsmoHero({
  title = "Como funciona",
  description = "Veja por dentro a plataforma que transforma diagnóstico, simulados e métricas em um plano de estudo com direção.",
  accent = "feito para o ENEM",
}: ComoFuncionaOsmoHeroProps) {
  const hasVideo = COMO_FUNCIONA_VIDEO_SRC.length > 0;
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="relative overflow-hidden bg-[#1f1e1c] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute top-[42%] right-0 left-0 h-px bg-white/[0.06]" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.06]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 pt-28 pb-6 md:px-8 md:pt-36 md:pb-10">
        <MarketingBlurReveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
                Produto
              </span>
              <span className="rounded-full border border-white/25 bg-transparent px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-white/85 uppercase">
                Como funciona
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b0ff57] px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-black uppercase">
              <Check className="size-3" strokeWidth={2.5} />
              Incluso no gratuito
            </span>
          </div>
        </MarketingBlurReveal>

        <div className="relative mx-auto mt-10 flex max-w-5xl flex-col items-center md:mt-12">
          <OsmoDialSpin
            variant="dark"
            reduceMotion={reduceMotion}
            className={cn(
              "pointer-events-none absolute top-0 left-1/2 aspect-square -translate-x-1/2",
              MARKETING_OSMO_DIAL_SIZE,
            )}
          />

          <div
            className={cn(
              "relative z-10 flex w-full flex-col items-center text-center",
              MARKETING_OSMO_HERO_TITLE_OFFSET,
            )}
          >
            <MarketingClipTitle
              as="h1"
              playOnMount
              delay={0.06}
              className={cn(
                "font-display mx-auto max-w-[min(100%,22em)] text-white",
                MARKETING_OSMO_HERO_TITLE,
              )}
            >
              {title}
            </MarketingClipTitle>

            <MarketingBlurReveal
              delay={0.12}
              className="mt-7 max-w-2xl md:mt-8"
            >
              <p className="text-base leading-relaxed text-white/55 md:text-lg md:leading-relaxed">
                {description}
              </p>
            </MarketingBlurReveal>

            <MarketingBlurReveal delay={0.18} className="mt-8 md:mt-10">
              <p
                className={cn(
                  caveat.className,
                  "text-xl text-[#b0ff57] md:text-2xl",
                )}
              >
                {accent}
                <span className="ml-2 inline-block rotate-[-8deg] text-[#b0ff57]/80">
                  ↑
                </span>
              </p>
            </MarketingBlurReveal>
          </div>
        </div>

        <div
          className="relative z-10 mx-auto mt-10 h-16 w-px bg-gradient-to-b from-white/20 to-white/5 md:mt-14 md:h-20"
          aria-hidden
        />
      </div>

      <div className="mx-auto w-[min(94vw,1320px)] px-4 pb-20 md:px-8 md:pb-28">
        <MarketingBlurReveal delay={0.22}>
          {hasVideo ? (
            <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#151314] shadow-[0_40px_100px_rgba(0,0,0,0.45)] md:rounded-[28px]">
              <MarketingLoopVideo src={COMO_FUNCIONA_VIDEO_SRC} fill={false} />
            </div>
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed border-white/10 bg-[#0d0d0d] md:rounded-[28px]">
              <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <Play
                  className="ml-1 size-7 text-white/35"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
              <p className="mt-4 font-mono text-[10px] tracking-[0.22em] text-white/30 uppercase">
                Vídeo em breve
              </p>
            </div>
          )}
        </MarketingBlurReveal>
      </div>
    </section>
  );
}
