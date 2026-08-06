"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

/** Workspace usa scroll interno (overflow-y-auto); Lenis root trava a rolagem. */
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
