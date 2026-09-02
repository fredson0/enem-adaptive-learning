"use client";

import {
  BRAND_ENTRANCE_LEFT,
  BRAND_ENTRANCE_RIGHT,
  BRAND_NAME,
} from "@/lib/brand";
import {
  LANDING_ENTRANCE_COLORS,
  LANDING_ENTRANCE_EASE,
  LANDING_ENTRANCE_EXPAND_EASE,
  LANDING_ENTRANCE_IMAGE,
  LANDING_ENTRANCE_STORAGE_KEY,
  LANDING_ENTRANCE_TIMINGS,
  LANDING_ENTRANCE_TITLE_CLASS,
} from "@/lib/landing-entrance-tokens";
import {
  LANDING_ENTRANCE_IMAGE_SRC,
  LANDING_HERO_VIDEO_URL,
} from "@/lib/landing-hero-media";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type EntrancePhase = "title" | "split" | "hold" | "expand" | "exit";

type LandingEntranceProps = {
  onComplete: () => void;
  onExpandStart?: () => void;
  onExpandComplete?: () => void;
};

type ViewportMetrics = {
  splitW: number;
  splitH: number;
  viewW: number;
  viewH: number;
};

const RADIUS = LANDING_ENTRANCE_IMAGE.radius;

function EntranceMedia({
  className,
  videoRef,
}: {
  className?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const hasImage = LANDING_ENTRANCE_IMAGE_SRC.length > 0;

  if (hasImage) {
    return (
      <Image
        src={LANDING_ENTRANCE_IMAGE_SRC}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={LANDING_HERO_VIDEO_URL}
      autoPlay
      muted
      loop
      playsInline
      className={cn("h-full w-full object-cover", className)}
      aria-hidden
    />
  );
}

function readMetrics(): ViewportMetrics {
  if (typeof window === "undefined") {
    return { splitW: 0, splitH: 0, viewW: 0, viewH: 0 };
  }

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  return {
    viewW,
    viewH,
    splitW: Math.round(viewW * (LANDING_ENTRANCE_IMAGE.animWidthVw / 100)),
    splitH: Math.round(viewW * (LANDING_ENTRANCE_IMAGE.animHeightVw / 100)),
  };
}

function useViewportMetrics(): ViewportMetrics {
  const [metrics, setMetrics] = useState<ViewportMetrics>({
    splitW: 0,
    splitH: 0,
    viewW: 0,
    viewH: 0,
  });

  useLayoutEffect(() => {
    const sync = () => setMetrics(readMetrics());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return metrics;
}

/** Em memória — zera a cada reload (F5). Evita pular intro na mesma aba. */
let introPlayedThisDocument = false;

function clearLegacyIntroStorage() {
  try {
    sessionStorage.removeItem(LANDING_ENTRANCE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function markLandingEntrancePlayed() {
  introPlayedThisDocument = true;
  clearLegacyIntroStorage();
}

export function shouldSkipLandingEntrance(): boolean {
  if (typeof window === "undefined") return false;

  clearLegacyIntroStorage();

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("replay-intro")) {
      introPlayedThisDocument = false;
      return false;
    }
    if (params.has("skip-intro")) {
      return true;
    }
    return introPlayedThisDocument;
  } catch {
    return false;
  }
}

export function LandingEntrance({
  onComplete,
  onExpandStart,
  onExpandComplete,
}: LandingEntranceProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<EntrancePhase>("title");
  const metrics = useViewportMetrics();
  const entranceVideoRef = useRef<HTMLVideoElement>(null);
  const onCompleteRef = useRef(onComplete);
  const onExpandStartRef = useRef(onExpandStart);
  const onExpandCompleteRef = useRef(onExpandComplete);

  onCompleteRef.current = onComplete;
  onExpandStartRef.current = onExpandStart;
  onExpandCompleteRef.current = onExpandComplete;

  const metricsReady = metrics.splitW > 0 && metrics.splitH > 0;

  useEffect(() => {
    if (reduceMotion === null) return;

    if (reduceMotion === true) {
      markLandingEntrancePlayed();
      onExpandStartRef.current?.();
      onExpandCompleteRef.current?.();
      onCompleteRef.current();
      return;
    }

    if (!metricsReady) return;

    const { titleIn, split, hold, expand, exit } = LANDING_ENTRANCE_TIMINGS;
    const splitAt = titleIn;
    const holdAt = titleIn + split;
    const expandAt = titleIn + split + hold;
    const exitAt = expandAt + expand;
    const doneAt = exitAt + exit;

    const t1 = window.setTimeout(() => setPhase("split"), splitAt);
    const t2 = window.setTimeout(() => setPhase("hold"), holdAt);
    const t3 = window.setTimeout(() => {
      onExpandStartRef.current?.();
      setPhase("expand");
    }, expandAt);
    const t4 = window.setTimeout(() => setPhase("exit"), exitAt);
    const t5 = window.setTimeout(() => {
      onExpandCompleteRef.current?.();
      markLandingEntrancePlayed();
      onCompleteRef.current();
    }, doneAt);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [reduceMotion, metricsReady]);

  const isTitle = phase === "title";
  const isExpand = phase === "expand" || phase === "exit";
  const isExit = phase === "exit";
  const splitSeconds = LANDING_ENTRANCE_TIMINGS.split / 1000;
  const expandSeconds = LANDING_ENTRANCE_TIMINGS.expand / 1000;
  const exitSeconds = LANDING_ENTRANCE_TIMINGS.exit / 1000;

  const { splitW, splitH, viewW, viewH } = metrics;
  const coverScale =
    splitW > 0 && splitH > 0
      ? Math.max(viewW / splitW, viewH / splitH) * 1.04
      : 1;

  const splitTween = {
    type: "tween" as const,
    duration: splitSeconds,
    ease: LANDING_ENTRANCE_EASE,
  };
  const expandTween = {
    type: "tween" as const,
    duration: expandSeconds,
    ease: LANDING_ENTRANCE_EXPAND_EASE,
  };

  const letterFade = {
    opacity: isExpand ? 0 : 1,
  };
  const letterFadeTransition = {
    opacity: {
      type: "tween" as const,
      duration: isExpand ? expandSeconds * 0.45 : 0.2,
      delay: isExpand ? expandSeconds * 0.08 : 0,
      ease: LANDING_ENTRANCE_EXPAND_EASE,
    },
  };

  if (reduceMotion === true) return null;

  if (reduceMotion === null) {
    return (
      <div
        className="fixed inset-0 z-[250]"
        style={{ backgroundColor: LANDING_ENTRANCE_COLORS.background }}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[250] overflow-hidden"
      aria-label={BRAND_NAME}
      style={{ backgroundColor: LANDING_ENTRANCE_COLORS.background }}
      initial={{ opacity: 1 }}
      animate={{ opacity: isExit ? 0 : 1 }}
      transition={{
        type: "tween",
        duration: exitSeconds,
        ease: LANDING_ENTRANCE_EASE,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          className="relative"
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{
            type: "tween",
            duration: LANDING_ENTRANCE_TIMINGS.titleIn / 1000,
            ease: LANDING_ENTRANCE_EASE,
          }}
        >
          <motion.span
            className={cn(
              LANDING_ENTRANCE_TITLE_CLASS,
              "absolute top-1/2 right-full z-20 -translate-y-1/2 pr-[0.05em] whitespace-nowrap",
            )}
            style={{ color: LANDING_ENTRANCE_COLORS.title }}
            initial={false}
            animate={letterFade}
            transition={letterFadeTransition}
          >
            {BRAND_ENTRANCE_LEFT}
          </motion.span>

          <motion.div
            className={cn(
              "relative overflow-hidden bg-[#1f1e1c]",
              isExpand ? "z-30" : "z-10",
            )}
            style={{ transformOrigin: "center center" }}
            initial={{ width: 0, height: 0, scale: 1, borderRadius: RADIUS }}
            animate={{
              width: isTitle ? 0 : splitW,
              height: isTitle ? 0 : splitH,
              scale: isExpand ? coverScale : 1,
              borderRadius: isExpand ? 0 : RADIUS,
            }}
            transition={{
              width: splitTween,
              height: splitTween,
              scale: expandTween,
              borderRadius: isExpand ? expandTween : splitTween,
            }}
            aria-hidden
          >
            <motion.div
              className="absolute"
              style={{
                width: viewW || "100vw",
                height: viewH || "100svh",
                left: "50%",
                top: "50%",
                marginLeft: viewW ? -(viewW / 2) : undefined,
                marginTop: viewH ? -(viewH / 2) : undefined,
                transformOrigin: "center center",
              }}
              initial={{ scale: 1 }}
              animate={{
                scale: isExpand && coverScale > 0 ? 1 / coverScale : 1,
              }}
              transition={{ scale: expandTween }}
            >
              <EntranceMedia
                className="absolute inset-0"
                videoRef={entranceVideoRef}
              />
            </motion.div>
          </motion.div>

          <motion.span
            className={cn(
              LANDING_ENTRANCE_TITLE_CLASS,
              "absolute top-1/2 left-full z-20 -translate-y-1/2 whitespace-nowrap",
            )}
            style={{ color: LANDING_ENTRANCE_COLORS.title }}
            initial={false}
            animate={letterFade}
            transition={letterFadeTransition}
          >
            {BRAND_ENTRANCE_RIGHT}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
