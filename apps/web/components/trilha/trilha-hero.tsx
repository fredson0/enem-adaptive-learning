"use client";

import { ProgressArcGauge } from "@/components/progresso/progress-arc-gauge";
import { TrilhaModalidadesCarousel } from "@/components/trilha/trilha-modalidades-carousel";
import type { TrilhaResponse } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Caveat } from "next/font/google";
import Link from "next/link";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

type TrilhaHeroProps = {
  trilha: TrilhaResponse;
};

export function TrilhaHero({ trilha }: TrilhaHeroProps) {
  const areas = trilha.areas;
  const areaPrioritaria = areas[0] ?? null;

  const hrefPrioridade = areaPrioritaria
    ? `/trilha/${areaPrioritaria.slug}`
    : "/trilha/diagnostico";

  const percentPrioridade = areaPrioritaria?.progresso ?? 0;

  return (
    <section className="space-y-12">
      <header className="relative mx-auto max-w-3xl text-center">
        <div className="relative mb-6 flex justify-center">
          <p
            className={cn(
              caveat.className,
              "text-xl text-[#b0ff57] sm:text-2xl",
            )}
          >
            Trilha e simulados
          </p>
        </div>

        <h2 className="text-3xl font-medium leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
          Um plano feito para onde você mais precisa evoluir.
        </h2>
      </header>

      <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Link
          href={hrefPrioridade}
          className="group relative flex h-[500px] flex-col overflow-hidden rounded-[32px] bg-[#5b4dff] px-6 py-8 text-white shadow-[0_24px_70px_rgba(91,77,255,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#6559ff] sm:px-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_18%,rgba(255,255,255,0.22),transparent_42%)]" />

          <div className="relative z-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/65">
              Prioridade alta
            </p>
            <p className="mt-3 text-xl font-medium tracking-tight sm:text-2xl">
              {areaPrioritaria
                ? `Trilha · ${areaPrioritaria.label}`
                : "Sua trilha prioritária"}
            </p>
            {areaPrioritaria?.disciplinasSugeridas.length ? (
              <p className="mt-2 text-sm text-white/70">
                {areaPrioritaria.disciplinasSugeridas.slice(0, 2).join(" · ")}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 mt-10 flex flex-1 flex-col items-center justify-center">
            <ProgressArcGauge
              percent={percentPrioridade}
              labelRight={
                areaPrioritaria?.prioridade === "Alta"
                  ? "Prioridade"
                  : "Foco agora"
              }
            />
          </div>

          <div className="relative z-10 mt-2 flex flex-col items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition group-hover:bg-black/35">
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
            <span className="text-xs text-white/75">
              Abrir trilha personalizada
            </span>
          </div>
        </Link>

        <div className="relative mx-auto flex h-[500px] w-full max-w-[500px] flex-col justify-between overflow-hidden rounded-full border border-white/[0.07] bg-[#161616] px-6 py-8 sm:px-10 lg:mx-0 lg:ml-auto lg:max-w-none">
          <div className="pointer-events-none absolute inset-8 rounded-full border border-white/[0.04]" />

          <div className="relative z-10 text-center">
            <p className="text-xl font-medium text-[#b0ff57] sm:text-2xl">
              Trilha geral
            </p>
            <p className="mt-2 text-sm text-white/55">
              Ver todas as modalidades
            </p>
          </div>

          <div className="relative z-10 mt-8 flex flex-1 items-center overflow-hidden">
            <TrilhaModalidadesCarousel />
          </div>

          <div className="relative z-10 mt-4 flex justify-center">
            <Link
              href="/trilha/geral"
              className="flex size-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
              aria-label="Ver todas as modalidades"
            >
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
