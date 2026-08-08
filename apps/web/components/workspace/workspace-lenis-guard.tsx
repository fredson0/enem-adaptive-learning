"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

/** Workspace usa scroll interno; Lenis (root) captura wheel — marque áreas com `data-lenis-prevent`. */
export function WorkspaceLenisGuard() {
  const lenis = useLenis();

  useEffect(() => {
    lenis?.stop();
    return () => {
      lenis?.start();
    };
  }, [lenis]);

  return null;
}
