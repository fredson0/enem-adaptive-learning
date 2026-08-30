"use client";

import { ProgressArcGauge } from "@/components/progresso/progress-arc-gauge";
import { TrilhaModalidadesCarousel } from "@/components/trilha/trilha-modalidades-carousel";
import { GlareCard } from "@/components/ui/glare-cards";
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
    <section className="space-y-6 sm:space-y-10 lg:space-y-12">
      <header className="relative mx-auto max-w-3xl px-1 text-center">
        <div className="relative mb-4 flex justify-center sm:mb-6">
          <p
            className={cn(
              caveat.className,
              "text-lg text-osmo-accent sm:text-2xl",
            )}
          >
            Trilha e simulados
          </p>
        </div>

        <h2 className="text-2xl font-medium leading-[1.2] tracking-tight text-osmo sm:text-3xl md:text-[2.75rem] md:leading-[1.15]">
          Um plano feito para onde você mais precisa evoluir.
        </h2>
      </header>

      <div className="grid items-stretch gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Link href={hrefPrioridade} className="group block">
          <GlareCard
            tiltIntensity={8}
            glareColor="rgba(255,255,255,0.22)"
            className="relative flex min-h-[340px] flex-col overflow-hidden rounded-[24px] border-transparent bg-[#5b4dff] px-5 py-6 text-white shadow-[0_24px_70px_rgba(91,77,255,0.28)] transition duration-300 hover:bg-[#6559ff] sm:min-h-[420px] sm:rounded-[32px] sm:px-8 sm:py-8 lg:min-h-[500px] osmo-surface-dark"
          >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_18%,rgba(255,255,255,0.22),transparent_42%)]" />

          <div className="relative z-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/65 sm:text-[11px]">
              Prioridade alta
            </p>
            <p className="mt-2 text-lg font-medium tracking-tight sm:mt-3 sm:text-2xl">
              {areaPrioritaria
                ? `Trilha · ${areaPrioritaria.label}`
                : "Sua trilha prioritária"}
            </p>
            {areaPrioritaria?.disciplinasSugeridas.length ? (
              <p className="mt-1.5 line-clamp-2 text-xs text-white/70 sm:mt-2 sm:text-sm">
                {areaPrioritaria.disciplinasSugeridas.slice(0, 2).join(" · ")}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 mt-6 flex flex-1 flex-col items-center justify-center sm:mt-10">
            <ProgressArcGauge
              percent={percentPrioridade}
              labelRight={
                areaPrioritaria?.prioridade === "Alta"
                  ? "Prioridade"
                  : "Foco agora"
              }
              className="max-w-[170px] sm:max-w-[220px]"
            />
          </div>

          <div className="relative z-10 mt-2 flex flex-col items-center gap-2 sm:gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition group-hover:bg-black/35 sm:size-11">
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
            <span className="text-[11px] text-white/75 sm:text-xs">
              Abrir trilha personalizada
            </span>
          </div>
          </GlareCard>
        </Link>

        <div className="relative mx-auto flex h-[min(360px,78vw)] w-full max-w-[min(100%,340px)] flex-col justify-between overflow-hidden rounded-full border border-white/[0.07] bg-[#161616] px-5 py-6 osmo-surface-dark sm:h-[420px] sm:max-w-[500px] sm:px-10 sm:py-8 lg:mx-0 lg:ml-auto lg:h-[500px] lg:max-w-none">
          <div className="relative z-10 text-center">
            <p className="text-lg font-medium text-osmo-accent sm:text-2xl">
              Trilha geral
            </p>
            <p className="mt-1.5 text-xs text-white/55 sm:mt-2 sm:text-sm">
              Ver todas as modalidades
            </p>
          </div>

          <div className="relative z-10 mt-2 flex flex-1 items-center overflow-hidden px-1 sm:mt-8">
            <TrilhaModalidadesCarousel />
          </div>

          <div className="relative z-10 mt-2 flex shrink-0 justify-center pb-1 sm:mt-4 sm:pb-0">
            <Link
              href="/trilha/geral"
              className="flex size-9 items-center justify-center rounded-full bg-[var(--osmo-text)] text-[var(--osmo-canvas)] transition hover:scale-105 sm:size-10"
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
