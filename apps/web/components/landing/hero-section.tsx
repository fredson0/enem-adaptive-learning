"use client";

import gsap from "gsap";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll("[data-hero-item]");
      if (!items?.length) return;

      gsap.fromTo(
        items,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center px-6 pt-48 pb-20 md:px-10 lg:px-16"
    >
      <div className="w-full max-w-7xl">
        <div className="max-w-2xl text-left md:max-w-3xl lg:max-w-4xl">
          <h1
            data-hero-item
            className="text-[2.75rem] leading-[1.02] font-normal tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.98] xl:text-[6.25rem]"
          >
            Sua aprovação no ENEM começa quando o estudo se adapta a você
          </h1>

          <p
            data-hero-item
            className="mt-6 max-w-lg text-sm leading-relaxed font-normal text-white md:mt-7 md:text-base"
          >
            ENEM+ ajusta simulados, tutor IA e métricas ao seu nível real —
            para você estudar com foco no que ainda falta aprender.
          </p>

          <a
            data-hero-item
            href="#como-funciona"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-normal text-[#60a5fa] transition hover:text-[#93c5fd]"
          >
            Saiba mais
            <ArrowDown className="size-3.5" strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
}
