"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export const SIDEBAR_ACCORDION_EASE = [0.22, 1, 0.36, 1] as const;

type SidebarAccordionProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

export function SidebarAccordion({
  open,
  children,
  className,
}: SidebarAccordionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className={className}>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="sidebar-accordion-panel"
            initial={{ height: reduceMotion ? "auto" : 0 }}
            animate={{ height: "auto" }}
            exit={{ height: reduceMotion ? "auto" : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.34,
              ease: SIDEBAR_ACCORDION_EASE,
            }}
            className="overflow-hidden"
            style={{ transformOrigin: "top" }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const sidebarAccordionEase = SIDEBAR_ACCORDION_EASE;
