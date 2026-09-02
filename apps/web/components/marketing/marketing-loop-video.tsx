"use client";

import { mediaTypeForSrc } from "@/lib/landing-hero-media";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type MarketingLoopVideoProps = {
  src: string;
  className?: string;
  /** `cover` preenche o recorte; `contain` mostra o vídeo inteiro. */
  objectFit?: "cover" | "contain";
  play?: boolean;
  /** `true` preenche o pai; `false` usa a altura nativa do arquivo (como na home). */
  fill?: boolean;
};

export function MarketingLoopVideo({
  src,
  className,
  objectFit = "cover",
  play = true,
  fill = true,
}: MarketingLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const shouldPlay = play && !reduceMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
  }, [shouldPlay, src]);

  const paintFirstFrame = () => {
    const video = videoRef.current;
    if (!video || video.currentTime > 0) return;
    video.currentTime = 0.05;
  };

  return (
    <video
      ref={videoRef}
      className={cn(
        fill
          ? "absolute inset-0 size-full"
          : "relative block h-auto w-full",
        objectFit === "cover" ? "object-cover" : "object-contain",
        className,
      )}
      autoPlay={shouldPlay}
      loop
      muted
      playsInline
      preload="auto"
      onLoadedData={paintFirstFrame}
      aria-hidden
    >
      <source src={src} type={mediaTypeForSrc(src)} />
    </video>
  );
}
