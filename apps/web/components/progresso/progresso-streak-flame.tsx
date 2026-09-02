"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { useId } from "react";

type ProgressoStreakFlameProps = {
  className?: string;
  lit?: boolean;
};

export function ProgressoStreakFlame({
  className,
  lit = true,
}: ProgressoStreakFlameProps) {
  const reactId = useId().replace(/:/g, "");
  const outerId = `streak-flame-outer-${reactId}`;
  const innerId = `streak-flame-inner-${reactId}`;
  const reduceMotion = useReducedMotion() ?? false;
  const animate = lit && !reduceMotion;

  return (
    <span
      className={cn(
        "relative inline-flex size-4 shrink-0 items-end justify-center",
        className,
      )}
      aria-hidden
    >
      {animate ? (
        <span className="streak-flame-glow pointer-events-none absolute inset-x-0 bottom-0 h-3 rounded-full" />
      ) : null}
      <svg
        viewBox="0 0 24 28"
        className={cn(
          "relative size-4 origin-bottom",
          animate && "streak-flame-outer",
          !lit && "opacity-45 grayscale",
        )}
      >
        <defs>
          <linearGradient id={outerId} x1="12" y1="28" x2="12" y2="2">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="38%" stopColor="#ea580c" />
            <stop offset="72%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
          <linearGradient id={innerId} x1="12" y1="26" x2="12" y2="10">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fff7ed" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${outerId})`}
          d="M12 2.2C8.4 7.4 5.2 10.2 5.2 16.1 5.2 20.6 8.2 24.6 12 26.6 15.8 24.6 18.8 20.6 18.8 16.1 18.8 10.2 15.6 7.4 12 2.2Z"
        />
        <path
          className={cn(animate && "streak-flame-inner origin-bottom")}
          fill={`url(#${innerId})`}
          d="M12 12.6c-1.7 2.2-2.6 3.8-2.6 6.1 0 2.2 1.1 4 2.6 4.8 1.5-.8 2.6-2.6 2.6-4.8 0-2.3-.9-3.9-2.6-6.1Z"
        />
      </svg>
    </span>
  );
}
