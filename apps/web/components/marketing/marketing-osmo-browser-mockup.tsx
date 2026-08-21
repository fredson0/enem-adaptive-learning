"use client";

import { LANDING_PLATFORM_VIDEO_SRC } from "@/lib/landing-hero-media";
import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { Play } from "lucide-react";

/** Vídeo da plataforma nas páginas de marketing (browser mockup). */
export const MARKETING_OSMO_VIDEO_SRC = LANDING_PLATFORM_VIDEO_SRC;

type MarketingOsmoBrowserMockupProps = {
  pathLabel?: string;
  placeholderTitle?: string;
  placeholderHint?: string;
  videoSrc?: string;
  reveal?: boolean;
};

export function MarketingOsmoBrowserMockup({
  pathLabel = "enemplus.app / plataforma",
  placeholderTitle = "Vídeo em breve",
  placeholderHint = "Espaço reservado para o vídeo da plataforma.",
  videoSrc = MARKETING_OSMO_VIDEO_SRC,
  reveal = true,
}: MarketingOsmoBrowserMockupProps) {
  const hasVideo = videoSrc.length > 0;

  const mockup = (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-[0_40px_100px_rgba(0,0,0,0.45)] md:rounded-3xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[10px] tracking-wide text-white/35">
          {pathLabel}
        </span>
      </div>

      <div className="relative aspect-video w-full bg-[#0d0d0d]">
        {hasVideo ? (
          <video
            src={videoSrc}
            className="size-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <Play
                className="ml-1 size-7 text-white/35"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/30 uppercase">
                {placeholderTitle}
              </p>
              <p className="mt-2 max-w-md text-sm text-white/45 md:text-base">
                {placeholderHint}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 md:px-8 md:pb-28">
      {reveal ? (
        <MarketingBlurReveal delay={0.22}>{mockup}</MarketingBlurReveal>
      ) : (
        mockup
      )}
    </div>
  );
}
