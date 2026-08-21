"use client";

import {
  LANDING_PLATFORM_VIDEO_SRC,
  LANDING_PLATFORM_VIDEO_TYPE,
} from "@/lib/landing-hero-media";
import {
  MARKETING_OSMO_COLORS,
} from "@/lib/marketing-osmo-tokens";
import { Play } from "lucide-react";
import Link from "next/link";

export function LandingPlatformShowcase() {
  const hasVideo = LANDING_PLATFORM_VIDEO_SRC.length > 0;

  return (
    <section
      id="plataforma"
      data-scroll-section
      className="relative bg-white px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-display text-[clamp(3.5rem,13vw,8.75rem)] leading-[0.88] font-semibold tracking-[-0.06em] text-[#0b1220]">
          A plataforma
        </h2>

        <p
          className="mx-auto mt-5 max-w-lg text-base leading-relaxed md:mt-6 md:text-lg"
          style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
        >
          Simulados, métricas, trilha e tutor IA num painel simples — para você
          estudar com direção.
        </p>
      </div>

      <div className="mx-auto mt-10 w-[min(94vw,1320px)] md:mt-14">
        {hasVideo ? (
          <div className="overflow-hidden rounded-[20px] border border-black/10 bg-[#0d0d0d] shadow-[0_32px_80px_rgba(0,0,0,0.14)] md:rounded-[28px]">
            <video
              className="block h-auto w-full"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source
                src={LANDING_PLATFORM_VIDEO_SRC}
                type={LANDING_PLATFORM_VIDEO_TYPE}
              />
            </video>
          </div>
        ) : (
          <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed border-[#0b1220]/12 bg-[#f5f5f5] md:rounded-[28px]">
            <div className="flex size-16 items-center justify-center rounded-full border border-[#0b1220]/10 bg-white/60">
              <Play className="ml-1 size-7 text-[#0b1220]/50" fill="currentColor" />
            </div>
            <p className="mt-4 text-sm font-medium text-[#0b1220]/55">
              Vídeo da plataforma em breve
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 text-center md:mt-12">
        <Link
          href="/tutor"
          className="inline-flex rounded-full px-8 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: MARKETING_OSMO_COLORS.ctaButton }}
        >
          Conhecer a plataforma
        </Link>
      </div>
    </section>
  );
}
