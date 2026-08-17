"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export function MarketingBlurReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();
  const animate = isInView && !reduceMotion;

  return (
    <motion.div
      ref={ref}
      initial={
        reduceMotion ? false : { y: 48, opacity: 0, filter: "blur(14px)" }
      }
      animate={
        animate
          ? { y: 0, opacity: 1, filter: "blur(0px)" }
          : reduceMotion
            ? undefined
            : {}
      }
      transition={{ duration: 0.9, delay, ease: REVEAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
