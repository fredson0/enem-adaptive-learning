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
  preload?: "none" | "metadata" | "auto";
};

export function MarketingLoopVideo({
  src,
  className,
  objectFit = "cover",
  play = true,
  fill = true,
  preload,
}: MarketingLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const shouldPlay = play && !reduceMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay) {
      const start = () => {
        void video.play().catch(() => undefined);
      };

      if (video.readyState >= 2) {
        start();
        return;
      }

      video.addEventListener("canplay", start, { once: true });
      video.addEventListener("loadeddata", start, { once: true });
      return () => {
        video.removeEventListener("canplay", start);
        video.removeEventListener("loadeddata", start);
      };
    }

    video.pause();
  }, [shouldPlay, src]);

  const paintFirstFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime === 0) {
      video.currentTime = 0.05;
    }
    if (shouldPlay) {
      void video.play().catch(() => undefined);
    }
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
      preload={preload ?? (play ? "auto" : "metadata")}
      onLoadedData={paintFirstFrame}
      aria-hidden
    >
      <source src={src} type={mediaTypeForSrc(src)} />
    </video>
  );
}
