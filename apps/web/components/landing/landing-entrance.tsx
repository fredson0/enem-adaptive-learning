"use client";

import {
  LANDING_ENTRANCE_COLORS,
  LANDING_ENTRANCE_EASE,
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
import { useEffect, useRef, useState } from "react";

type EntrancePhase = "title" | "split" | "hold" | "expand" | "exit";

type LandingEntranceProps = {
  onComplete: () => void;
  onExpandStart?: () => void;
  onExpandComplete?: () => void;
};

function EntranceMedia({ className }: { className?: string }) {
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

const sizeTransition = (seconds: number) => ({
  width: { duration: seconds, ease: LANDING_ENTRANCE_EASE },
  height: { duration: seconds, ease: LANDING_ENTRANCE_EASE },
  borderRadius: { duration: seconds, ease: LANDING_ENTRANCE_EASE },
});

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
  const onCompleteRef = useRef(onComplete);
  const onExpandStartRef = useRef(onExpandStart);
  const onExpandCompleteRef = useRef(onExpandComplete);

  onCompleteRef.current = onComplete;
  onExpandStartRef.current = onExpandStart;
  onExpandCompleteRef.current = onExpandComplete;

  useEffect(() => {
    if (reduceMotion === null) return;

    if (reduceMotion === true) {
      markLandingEntrancePlayed();
      onExpandStartRef.current?.();
      onExpandCompleteRef.current?.();
      onCompleteRef.current();
      return;
    }

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
  }, [reduceMotion]);

  const isTitle = phase === "title";
  const isExpand = phase === "expand" || phase === "exit";
  const isExit = phase === "exit";
  const splitSeconds = LANDING_ENTRANCE_TIMINGS.split / 1000;
  const expandSeconds = LANDING_ENTRANCE_TIMINGS.expand / 1000;
  const exitSeconds = LANDING_ENTRANCE_TIMINGS.exit / 1000;
  const mediaOpen = !isTitle && !isExpand;

  const mediaWidth = isExpand
    ? "100vw"
    : mediaOpen
      ? LANDING_ENTRANCE_IMAGE.animWidth
      : "0px";
  const mediaHeight = isExpand
    ? "100svh"
    : mediaOpen
      ? LANDING_ENTRANCE_IMAGE.animHeight
      : "0px";
  const mediaRadius = isExpand ? 0 : mediaOpen ? 12 : 0;
  const sizeTransitionSeconds = isExpand ? expandSeconds : splitSeconds;

  const letterFade = {
    opacity: isExpand ? 0 : 1,
  };
  const letterFadeTransition = {
    opacity: {
      duration: isExpand ? expandSeconds * 0.7 : 0.2,
      delay: isExpand ? expandSeconds * 0.15 : 0,
      ease: LANDING_ENTRANCE_EASE,
    },
  };

  if (reduceMotion === true) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[250] overflow-hidden"
      style={{ backgroundColor: LANDING_ENTRANCE_COLORS.background }}
      animate={{ opacity: isExit ? 0 : 1 }}
      transition={{
        duration: exitSeconds,
        ease: LANDING_ENTRANCE_EASE,
      }}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <motion.div
          className="relative flex items-center justify-center gap-0 text-[0px]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: LANDING_ENTRANCE_TIMINGS.titleIn / 1000,
            ease: LANDING_ENTRANCE_EASE,
          }}
        >
          <motion.span
            className={cn(
              LANDING_ENTRANCE_TITLE_CLASS,
              "relative z-40 shrink-0 text-[#0b0b0b]",
            )}
            animate={letterFade}
            transition={letterFadeTransition}
          >
            ENE
          </motion.span>
          <motion.div
            className="relative shrink-0"
            initial={false}
            animate={{
              width: mediaWidth,
              height: mediaHeight,
            }}
            transition={sizeTransition(sizeTransitionSeconds)}
            aria-hidden={isExpand}
          >
            <motion.div
              className={cn(
                "overflow-hidden bg-[#0d0d0d]",
                isExpand &&
                  "fixed top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2",
              )}
              initial={false}
              animate={{
                width: mediaWidth,
                height: mediaHeight,
                borderRadius: mediaRadius,
              }}
              transition={sizeTransition(sizeTransitionSeconds)}
            >
              <div className="relative h-full w-full">
                <EntranceMedia className="absolute inset-0" />
              </div>
            </motion.div>
          </motion.div>
          <motion.span
            className={cn(
              LANDING_ENTRANCE_TITLE_CLASS,
              "relative z-40 -ml-[0.05em] shrink-0 text-[#0b0b0b]",
            )}
            animate={letterFade}
            transition={letterFadeTransition}
          >
            M+
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
