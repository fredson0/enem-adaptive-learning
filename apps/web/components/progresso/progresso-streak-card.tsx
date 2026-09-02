"use client";

import { ProgressoStreakFlame } from "@/components/progresso/progresso-streak-flame";
import type { RitmoSemanal } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ProgressoStreakCardProps = {
  ritmo: RitmoSemanal;
};

export function ProgressoStreakCard({ ritmo }: ProgressoStreakCardProps) {
  const labelDias =
    ritmo.diasAtivosNaSemana === 1
      ? "1 dia"
      : `${ritmo.diasAtivosNaSemana} dias`;

  return (
    <section className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-osmo-subtle">
        Ritmo da semana
      </p>
      <p className="mt-3 text-4xl font-medium tracking-tight text-osmo sm:text-5xl">
        {labelDias}
      </p>
      <p className="mt-1 text-sm text-osmo-muted">com prática esta semana</p>

      <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-3">
        {ritmo.dias.map((dia) => (
          <div
            key={dia.label}
            className="flex min-w-0 flex-col items-center gap-2"
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full border transition sm:size-11",
                dia.ativo
                  ? "border-[color-mix(in_srgb,var(--osmo-accent)_40%,transparent)] bg-osmo-accent text-[var(--osmo-accent-fg)]"
                  : "border-[var(--osmo-border)] text-osmo-subtle",
                dia.hoje && !dia.ativo && "ring-1 ring-white/25",
              )}
            >
              {dia.ativo ? (
                <Check className="size-4" strokeWidth={2.5} />
              ) : (
                <span className="size-1.5 rounded-full bg-white/15" />
              )}
            </div>
            <span
              className={cn(
                "text-[9px] uppercase tracking-[0.14em]",
                dia.hoje ? "text-osmo-muted" : "text-osmo-subtle",
              )}
            >
              {dia.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-osmo-muted">
        <span className="inline-flex items-center gap-1.5">
          <ProgressoStreakFlame lit={ritmo.sequenciaAtual > 0} />
          {ritmo.sequenciaAtual > 0
            ? `${ritmo.sequenciaAtual} dia${ritmo.sequenciaAtual === 1 ? "" : "s"} seguidos`
            : "Sem sequência ativa"}
        </span>
        {ritmo.melhorSequencia > 0 ? (
          <span className="text-osmo-subtle">
            Melhor: {ritmo.melhorSequencia} dia
            {ritmo.melhorSequencia === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
    </section>
  );
}
