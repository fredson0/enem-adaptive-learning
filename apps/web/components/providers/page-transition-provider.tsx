"use client";

import {
  PAGE_TRANSITION_COLOR,
  PAGE_TRANSITION_SLATS,
  normalizePath,
  shouldSkipPageTransition,
} from "@/lib/page-transition";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const overlayRef = useRef<HTMLDivElement>(null);
  const slatsRef = useRef<HTMLDivElement[]>([]);
  const busyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);

  pathnameRef.current = pathname;

  const slats = () => slatsRef.current.filter(Boolean);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(slats(), { scaleY: 0 });
  }, []);

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const pendingPath = pending.split("#")[0];
    const current = `${pathname}${window.location.search}`;
    if (pendingPath !== current && pendingPath !== pathname) return;

    pendingRef.current = null;
    const overlay = overlayRef.current;
    const bars = slats();
    if (!overlay || bars.length === 0) {
      busyRef.current = false;
      return;
    }

    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    gsap.killTweensOf(bars);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(bars, { scaleY: 0 });
        busyRef.current = false;
        tl.kill();
      },
    });

    tl.to(bars, {
      scaleY: 0,
      duration: 0.72,
      ease: "power3.inOut",
      stagger: { each: 0.045, from: "end" },
    });
  }, [pathname, lenis]);

  useEffect(() => {
    const coverThenNavigate = (href: string) => {
      if (busyRef.current) return;
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }

      const overlay = overlayRef.current;
      const bars = slats();
      if (!overlay || bars.length === 0) {
        router.push(href);
        return;
      }

      gsap.killTweensOf(bars);
      gsap.killTweensOf(overlay);

      busyRef.current = true;
      pendingRef.current = href.split("#")[0];

      gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(bars, { scaleY: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        onComplete: () => {
          router.push(href);
          tl.kill();
        },
      });

      tl.to(bars, {
        scaleY: 1,
        duration: 0.78,
        ease: "power3.inOut",
        stagger: { each: 0.05, from: "start" },
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition === "true") return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const next = normalizePath(url);
      const current = `${pathnameRef.current}${window.location.search}`;

      if (url.hash && next === current) return;
      if (shouldSkipPageTransition(pathnameRef.current, url.pathname)) return;

      event.preventDefault();
      event.stopPropagation();
      coverThenNavigate(`${next}${url.hash}`);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <>
      {children}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[180] flex flex-col overflow-hidden"
        aria-hidden
      >
        {PAGE_TRANSITION_SLATS.map((weight, index) => (
          <div
            key={index}
            ref={(node) => {
              if (node) slatsRef.current[index] = node;
            }}
            className="w-full origin-center will-change-transform"
            style={{
              flexGrow: weight,
              backgroundColor: PAGE_TRANSITION_COLOR,
              transform: "scaleY(0)",
            }}
          />
        ))}
      </div>
    </>
  );
}
