"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface SlideHoverButtonProps {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
  "data-no-transition"?: string;
}

export function SlideHoverButton({
  href,
  label,
  className,
  onClick,
  "data-no-transition": noTransition,
}: SlideHoverButtonProps) {
  const trackRef = useRef<HTMLSpanElement>(null);
  const viewportRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Animation | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const firstItem = track?.children[0] as HTMLElement | undefined;

    if (!track || !viewport || !firstItem) return;

    const syncViewport = () => {
      viewport.style.width = `${firstItem.offsetWidth}px`;
      gsap.set(track, { x: 0 });
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, [label]);

  const slideTo = (x: number) => {
    const track = trackRef.current;
    if (!track) return;

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(track, {
      x,
      duration: 0.38,
      ease: "power2.inOut",
      overwrite: true,
    });
  };

  const handleEnter = () => {
    const track = trackRef.current;
    const firstItem = track?.children[0] as HTMLElement | undefined;
    if (!firstItem) return;

    slideTo(-firstItem.offsetWidth);
  };

  const handleLeave = () => {
    slideTo(0);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      data-no-transition={noTransition}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(
        "inline-flex h-10 items-center justify-center px-5 text-sm font-medium",
        className,
      )}
    >
      <span ref={viewportRef} className="block overflow-hidden leading-none">
        <span ref={trackRef} className="flex w-max will-change-transform">
          <span className="shrink-0 whitespace-nowrap">{label}</span>
          <span className="shrink-0 whitespace-nowrap" aria-hidden>
            {label}
          </span>
        </span>
      </span>
    </Link>
  );
}
