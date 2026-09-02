"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import UnicornScene from "unicornstudio-react/next";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
}

export function BloimAnimationBackground() {
  const { width, height } = useWindowSize();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || width === 0 || height === 0) {
    return (
      <div className="fixed inset-0 -z-10 bg-[#05070d]" aria-hidden="true" />
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070d]",
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#05070d]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/20 via-transparent to-[#05070d]" />
      <UnicornScene
        production
        projectId="9tVO0xGS8DIar1DF4Sqc"
        width={width}
        height={height}
        lazyLoad
        fps={30}
        ariaLabel="Animação de fundo da plataforma ENEM+IA"
      />
    </div>
  );
}
