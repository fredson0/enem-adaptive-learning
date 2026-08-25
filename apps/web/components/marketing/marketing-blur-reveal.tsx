"use client";

import { REVEAL_MOTION } from "@/lib/scroll-lenis-config";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

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
      initial={reduceMotion ? false : { y: REVEAL_MOTION.y, opacity: 0 }}
      animate={
        animate
          ? { y: 0, opacity: 1 }
          : reduceMotion
            ? undefined
            : {}
      }
      transition={{
        duration: REVEAL_MOTION.duration,
        delay,
        ease: REVEAL_MOTION.ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
