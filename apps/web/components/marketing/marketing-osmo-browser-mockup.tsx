"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import {
  LANDING_PLATFORM_VIDEO_SRC,
  LANDING_PLATFORM_VIDEO_TYPE,
} from "@/lib/landing-hero-media";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

/** Vídeo da plataforma nas páginas de marketing. */
export const MARKETING_OSMO_VIDEO_SRC = LANDING_PLATFORM_VIDEO_SRC;

type MarketingOsmoBrowserMockupProps = {
  placeholderTitle?: string;
  placeholderHint?: string;
  videoSrc?: string;
  reveal?: boolean;
  variant?: "dark" | "light";
};

export function MarketingOsmoBrowserMockup({
  placeholderTitle = "Vídeo em breve",
  placeholderHint = "Espaço reservado para o vídeo da plataforma.",
  videoSrc = MARKETING_OSMO_VIDEO_SRC,
  reveal = true,
  variant = "dark",
}: MarketingOsmoBrowserMockupProps) {
  const hasVideo = videoSrc.length > 0;
  const isLight = variant === "light";

  const showcase = (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] md:rounded-[28px]",
        isLight
          ? "border border-black/10 bg-[#0d0d0d] shadow-[0_32px_80px_rgba(0,0,0,0.14)]"
          : "border border-white/10 bg-[#0d0d0d] shadow-[0_40px_100px_rgba(0,0,0,0.45)]",
      )}
    >
      {hasVideo ? (
        <video
          className="block h-auto w-full"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src={videoSrc} type={LANDING_PLATFORM_VIDEO_TYPE} />
        </video>
      ) : (
        <div className="relative flex aspect-video w-full flex-col items-center justify-center px-6 text-center">
          <div
            className={
              isLight
                ? "flex size-16 items-center justify-center rounded-full border border-[#0b1220]/10 bg-white/60"
                : "flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
            }
          >
            <Play
              className={
                isLight
                  ? "ml-1 size-7 text-[#0b1220]/50"
                  : "ml-1 size-7 text-white/35"
              }
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
          <div className="mt-4">
            <p
              className={
                isLight
                  ? "font-mono text-[10px] tracking-[0.22em] text-[#0b1220]/40 uppercase"
                  : "font-mono text-[10px] tracking-[0.22em] text-white/30 uppercase"
              }
            >
              {placeholderTitle}
            </p>
            <p
              className={
                isLight
                  ? "mt-2 max-w-md text-sm text-[#0b1220]/55 md:text-base"
                  : "mt-2 max-w-md text-sm text-white/45 md:text-base"
              }
            >
              {placeholderHint}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-[min(94vw,1320px)] pb-20 md:pb-28">
      {reveal ? (
        <MarketingBlurReveal delay={0.22}>{showcase}</MarketingBlurReveal>
      ) : (
        showcase
      )}
    </div>
  );
}
