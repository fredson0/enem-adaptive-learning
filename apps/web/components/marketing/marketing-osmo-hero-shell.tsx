"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { OsmoDialSpin, MARKETING_OSMO_DIAL_SIZE } from "@/components/marketing/osmo-dial";
import {
  MARKETING_OSMO_HERO_TITLE,
  MARKETING_OSMO_HERO_TITLE_OFFSET,
  MARKETING_OSMO_HERO_TITLE_OFFSET_LIGHT,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { Caveat } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { MarketingOsmoBrowserMockup } from "@/components/marketing/marketing-osmo-browser-mockup";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

type MarketingOsmoHeroShellProps = {
  variant?: "dark" | "light";
  title: ReactNode;
  description?: string;
  accent?: string;
  eyebrowLeft?: string;
  eyebrowRight?: string;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  titleOffset?: string;
  titleClassName?: string;
  /** Vídeo da plataforma abaixo do hero (Tutor / Trilha). */
  platformVideo?: boolean;
};

export function MarketingOsmoHeroShell({
  variant = "dark",
  title,
  description,
  accent,
  eyebrowLeft = "Produto",
  eyebrowRight,
  badge,
  children,
  className,
  style,
  titleOffset,
  titleClassName,
  platformVideo = false,
}: MarketingOsmoHeroShellProps) {
  const isLight = variant === "light";
  const reduceMotion = useReducedMotion() ?? false;
  const resolvedTitleOffset =
    titleOffset ??
    (isLight
      ? MARKETING_OSMO_HERO_TITLE_OFFSET_LIGHT
      : MARKETING_OSMO_HERO_TITLE_OFFSET);

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        isLight ? "bg-white text-[#0b1220]" : "bg-[#151314] text-white",
        className,
      )}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div
          className={cn(
            "absolute top-[42%] right-0 left-0 h-px",
            isLight ? "bg-[#0b1220]/[0.06]" : "bg-white/[0.06]",
          )}
        />
        <div
          className={cn(
            "absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2",
            isLight ? "bg-[#0b1220]/[0.06]" : "bg-white/[0.06]",
          )}
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 pt-28 pb-8 md:px-8 md:pt-36 md:pb-12">
        {(eyebrowLeft || eyebrowRight || badge) && (
          <MarketingBlurReveal>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {eyebrowLeft ? (
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.22em] uppercase",
                      isLight
                        ? "border-[#0b1220]/10 bg-[#0b1220]/[0.03] text-[#0b1220]/40"
                        : "border-white/10 bg-white/[0.04] text-white/40",
                    )}
                  >
                    {eyebrowLeft}
                  </span>
                ) : null}
                {eyebrowRight ? (
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.22em] uppercase",
                      isLight
                        ? "border-[#0b1220]/20 bg-transparent text-[#0b1220]/80"
                        : "border-white/25 bg-transparent text-white/85",
                    )}
                  >
                    {eyebrowRight}
                  </span>
                ) : null}
              </div>
              {badge}
            </div>
          </MarketingBlurReveal>
        )}

        <div
          className={cn(
            "relative left-1/2 w-screen -translate-x-1/2",
            eyebrowLeft || eyebrowRight || badge ? "mt-10 md:mt-12" : "mt-4",
          )}
        >
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 md:px-8">
          <OsmoDialSpin
            variant={variant}
            reduceMotion={reduceMotion}
            className={cn(
              "pointer-events-none absolute top-0 left-1/2 aspect-square -translate-x-1/2",
              MARKETING_OSMO_DIAL_SIZE,
            )}
          />

          <div className="relative z-10 flex w-full flex-col items-center text-center">
            <div className={cn("w-full", resolvedTitleOffset)}>
              <MarketingBlurReveal
                delay={0.06}
                className="flex w-full justify-center"
              >
                <h1
                  className={cn(
                    "font-display mx-auto max-w-[min(100%,22em)] text-center text-balance",
                    MARKETING_OSMO_HERO_TITLE,
                    isLight ? "text-[#0b1220]" : "text-white",
                    titleClassName,
                  )}
                >
                  {title}
                </h1>
              </MarketingBlurReveal>
            </div>

            {description ? (
              <MarketingBlurReveal
                delay={0.12}
                className="mt-7 max-w-2xl md:mt-8"
              >
                <p
                  className={cn(
                    "text-base leading-relaxed md:text-lg md:leading-relaxed",
                    isLight ? "text-[#0b1220]/55" : "text-white/55",
                  )}
                >
                  {description}
                </p>
              </MarketingBlurReveal>
            ) : null}

            {accent ? (
              <MarketingBlurReveal delay={0.16} className="mt-8 md:mt-10">
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
            ) : null}

            {children ? (
              <MarketingBlurReveal delay={0.2} className="mt-10 w-full">
                {children}
              </MarketingBlurReveal>
            ) : null}
          </div>
          </div>
        </div>
      </div>

      {platformVideo && !isLight ? (
        <div className="relative z-10 px-4 md:px-8">
          <div
            className="mx-auto mt-10 h-16 w-px bg-gradient-to-b from-white/20 to-white/5 md:mt-14 md:h-20"
            aria-hidden
          />
          <MarketingOsmoBrowserMockup />
        </div>
      ) : null}
    </section>
  );
}
