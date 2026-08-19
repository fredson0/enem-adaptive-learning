"use client";

import {
  MARKETING_OSMO_DIAL_SIZE,
  MARKETING_OSMO_DIAL_SPIN,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

const DIAL_SPIN_EASE = MARKETING_OSMO_DIAL_SPIN.ease;

type OsmoDialVariant = "dark" | "light";

function OsmoDialGraphic({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: OsmoDialVariant;
}) {
  const ticks = 72;
  const radius = 42;
  const isLight = variant === "light";

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("pointer-events-none size-full", className)}
      aria-hidden
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.15"
        className={isLight ? "text-[#0b1220]/[0.06]" : "text-white/[0.06]"}
      />
      {Array.from({ length: ticks }).map((_, index) => {
        const angle = (index / ticks) * Math.PI * 2 - Math.PI / 2;
        const isMajor = index % 6 === 0;
        const inner = radius - (isMajor ? 3.2 : 1.6);
        const outer = radius;
        const x1 = 50 + Math.cos(angle) * inner;
        const y1 = 50 + Math.sin(angle) * inner;
        const x2 = 50 + Math.cos(angle) * outer;
        const y2 = 50 + Math.sin(angle) * outer;

        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={isMajor ? 0.22 : 0.12}
            className={
              isMajor
                ? isLight
                  ? "text-[#0b1220]/10"
                  : "text-white/10"
                : isLight
                  ? "text-[#0b1220]/[0.05]"
                  : "text-white/[0.05]"
            }
          />
        );
      })}
    </svg>
  );
}

export function OsmoDialSpin({
  className,
  variant = "dark",
  reduceMotion,
}: {
  className?: string;
  variant?: OsmoDialVariant;
  reduceMotion: boolean;
}) {
  if (reduceMotion) {
    return (
      <div className={className}>
        <OsmoDialGraphic variant={variant} />
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ rotate: MARKETING_OSMO_DIAL_SPIN.fromRotate, opacity: 0.35 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{
        rotate: {
          duration: MARKETING_OSMO_DIAL_SPIN.duration,
          ease: DIAL_SPIN_EASE,
        },
        opacity: { duration: 1.2, ease: "easeOut" },
      }}
    >
      <OsmoDialGraphic variant={variant} />
    </motion.div>
  );
}

export { MARKETING_OSMO_DIAL_SIZE };
