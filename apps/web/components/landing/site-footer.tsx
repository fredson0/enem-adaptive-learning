"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const BRAND_LETTERS = ["E", "N", "E", "M", "+"];

function getLetterOffsets(index: number, total: number) {
  const center = (total - 1) / 2;
  const dist = index - center;

  return {
    rotate: dist * 18,
    y: Math.abs(dist) * 42 + dist * dist * 14,
    x: dist * 10,
  };
}

const FOOTER_LINKS = [
  { label: "Login", href: "/login" },
  { label: "Planos", href: "#planos" },
  { label: "Plataforma", href: "#plataforma" },
  { label: "Depoimentos", href: "#depoimentos" },
];

export function SiteFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[];
    if (!section || letters.length === 0) return;

    const ctx = gsap.context(() => {
      letters.forEach((letter, index) => {
        const { rotate, y, x } = getLetterOffsets(index, BRAND_LETTERS.length);
        gsap.set(letter, {
          rotate,
          y,
          x,
          transformOrigin: "50% 100%",
        });
      });

      gsap.to(letters, {
        rotate: 0,
        x: 0,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            if (self.progress >= 0.995) {
              gsap.set(letters, { rotate: 0, x: 0, y: 0 });
            }
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="relative flex min-h-[95svh] flex-col justify-between overflow-hidden bg-[#f3f3f1] px-4 pb-8 pt-10 md:px-8 md:pb-10"
    >
      <div className="relative left-1/2 flex flex-1 w-screen max-w-[100vw] -translate-x-1/2 items-end justify-center overflow-hidden px-2 pb-6 md:px-4 md:pb-10">
        <p
          className="font-display flex w-full max-w-[min(100vw,1680px)] items-end justify-between leading-[0.72] font-semibold tracking-[-0.05em] text-[#0b1220] select-none"
          aria-label="ENEM+"
        >
          {BRAND_LETTERS.map((char, index) => (
            <span
              key={`${char}-${index}`}
              ref={(el) => {
                lettersRef.current[index] = el;
              }}
              className="inline-block flex-1 text-center will-change-transform"
              style={{
                fontSize: "clamp(5.5rem, 27vw, 19rem)",
              }}
            >
              {char}
            </span>
          ))}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between gap-5 border-t border-black/10 pt-6 md:flex-row">
        <div className="flex flex-wrap justify-center gap-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full bg-black px-3.5 py-1.5 text-[10px] font-medium tracking-[0.14em] text-white uppercase transition hover:bg-black/85"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="font-mono text-[10px] tracking-[0.12em] text-[#0b1220]/45 uppercase">
          © 2026 ENEM+
        </p>

        <p className="text-center text-[10px] tracking-[0.08em] text-[#0b1220]/40 uppercase md:text-right">
          Plataforma educacional adaptativa
        </p>
      </div>
    </footer>
  );
}
