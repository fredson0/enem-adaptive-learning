import { LandingArcCarousel } from "@/components/landing/landing-arc-carousel";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingProductShowcase() {
  return (
    <section
      id="como-funciona"
      data-scroll-section
      className="font-display relative z-10 overflow-x-clip bg-white px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] text-center">
        <h2 className="font-display mx-auto max-w-4xl px-2 text-[clamp(1.65rem,4.2vw,5.25rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance text-[#0b1220] md:max-w-5xl lg:max-w-none lg:w-max lg:text-[clamp(2rem,4.6vw,5.25rem)] lg:leading-[0.9] lg:tracking-[-0.055em] lg:whitespace-nowrap">
          Preparação ENEM{" "}
          <span
            className="mx-[0.08em] inline-block align-middle text-[#7c6cff]"
            aria-hidden
          >
            ✦
          </span>{" "}
          que se adapta a você
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#0b1220]/60 md:text-base">
          Plataforma com{" "}
          <span className="rounded-full bg-[#f0f0ee] px-2 py-0.5 text-[#0b1220]/80">
            simulados
          </span>
          ,{" "}
          <span className="rounded-full bg-[#f0f0ee] px-2 py-0.5 text-[#0b1220]/80">
            tutor IA
          </span>
          ,{" "}
          <span className="rounded-full bg-[#f0f0ee] px-2 py-0.5 text-[#0b1220]/80">
            trilha
          </span>{" "}
          e{" "}
          <span className="rounded-full bg-[#f0f0ee] px-2 py-0.5 text-[#0b1220]/80">
            métricas
          </span>{" "}
          — tudo ajustado ao que você ainda precisa dominar.
        </p>

        <p className="mx-auto mt-3 max-w-xl text-sm text-[#0b1220]/45">
          Feito para vestibulandos que querem estudar com foco, não com volume.
        </p>
      </div>

      <LandingArcCarousel />

      <div className="mx-auto mt-10 max-w-3xl px-4 text-center md:mt-14">
        <p className="font-display text-[clamp(1.25rem,2.8vw,2rem)] leading-[1.22] font-medium tracking-[-0.03em] text-balance text-[#0b1220]">
          ENEM+ é uma plataforma que evolui com você — simulados, tutor IA, trilha
          e métricas no mesmo lugar, sempre ajustados ao que você ainda precisa
          dominar.
        </p>

        <Link
          href="/login"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#b0ff57] py-1 pr-1 pl-5 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
        >
          Começar agora
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
            <ArrowRight className="h-4 w-4 text-[#E1E0CC]" />
          </span>
        </Link>
      </div>
    </section>
  );
}
