"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  type HTMLMotionProps,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlareCardProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  glareColor?: string;
  tiltIntensity?: number;
}

const GlareCard = React.forwardRef<HTMLDivElement, GlareCardProps>(
  (
    {
      children,
      className,
      glareColor = "rgba(255,255,255,0.2)",
      tiltIntensity = 15,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const [isHovered, setIsHovered] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150, mass: 0.6 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!internalRef.current || prefersReducedMotion) return;

      const rect = internalRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normalizedX = (e.clientX - centerX) / (rect.width / 2);
      const normalizedY = (e.clientY - centerY) / (rect.height / 2);

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      mouseX.set(0);
      mouseY.set(0);
    };

    const rotateX = useMotionTemplate`${springY.get() * -tiltIntensity}deg`;
    const rotateY = useMotionTemplate`${springX.get() * tiltIntensity}deg`;

    const backgroundGlare = useMotionTemplate`radial-gradient(
      circle at calc(50% + ${springX.get() * 100}%) calc(50% + ${springY.get() * 100}%),
      ${glareColor} 0%,
      transparent 80%
    )`;

    const borderHighlight = useMotionTemplate`conic-gradient(
      from 0deg at calc(50% + ${springX.get() * 50}%) calc(50% + ${springY.get() * 50}%),
      transparent,
      ${glareColor},
      transparent
    )`;

    return (
      <motion.div
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
        className={cn(
          "relative group isolate overflow-hidden rounded-[2rem] border backdrop-blur-xl transition-all duration-500",
          "border-[var(--osmo-border)] bg-[var(--osmo-card)]",
          "hover:border-[color-mix(in_srgb,var(--osmo-text)_12%,transparent)] hover:shadow-lg",
          className,
        )}
        {...props}
      >
        <motion.div
          className="absolute inset-[-1px] z-30 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: borderHighlight,
            WebkitMaskImage:
              "linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)",
            WebkitMaskComposite: "destination-out",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-soft-light"
          style={{ background: backgroundGlare }}
        />

        <motion.div
          className="pointer-events-none absolute inset-[-50%] z-0 rotate-[15deg] opacity-0 transition-opacity duration-1000 group-hover:opacity-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            x: useMotionTemplate`${springX.get() * -20}%`,
          }}
        />

        <div
          className="relative z-40 h-full w-full"
          style={{
            transform: prefersReducedMotion ? "none" : "translateZ(50px)",
            filter: isHovered
              ? "drop-shadow(0 20px 30px rgba(0,0,0,0.5))"
              : "none",
            transition: "filter 0.5s ease",
          }}
        >
          {children}
        </div>
      </motion.div>
    );
  },
);

GlareCard.displayName = "GlareCard";

export { GlareCard };
