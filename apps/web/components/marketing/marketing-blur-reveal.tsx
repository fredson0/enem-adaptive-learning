"use client";

import { motionRevealState } from "@/lib/motion-reveal";
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
  const reveal = motionRevealState(reduceMotion, isInView, {
    y: REVEAL_MOTION.y,
    opacity: 0,
  });

  return (
    <motion.div
      ref={ref}
      initial={reveal.initial}
      animate={reveal.animate}
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
