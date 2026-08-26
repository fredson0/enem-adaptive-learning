"use client";

import { ProgressoCard } from "@/components/progresso/progresso-card";
import type { RitmoSemanal } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { Check, Flame } from "lucide-react";

type ProgressoStreakCardProps = {
  ritmo: RitmoSemanal;
};

export function ProgressoStreakCard({ ritmo }: ProgressoStreakCardProps) {
  const labelDias =
    ritmo.diasAtivosNaSemana === 1
      ? "1 dia"
      : `${ritmo.diasAtivosNaSemana} dias`;

  return (
    <ProgressoCard icon={<Flame className="size-4" />} title="Ritmo da semana">
      <p className="text-2xl font-medium tracking-tight text-osmo sm:text-3xl">
        {labelDias}
      </p>
      <p className="mt-0.5 text-[11px] text-osmo-subtle sm:mt-1 sm:text-xs">
        com prática esta semana
      </p>

      <div className="mt-4 flex justify-between gap-0.5 sm:mt-5 sm:gap-1">
        {ritmo.dias.map((dia) => (
          <div key={dia.label} className="flex flex-col items-center gap-1 sm:gap-1.5">
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-full border transition sm:size-7",
                dia.ativo
                  ? "border-[color-mix(in_srgb,var(--osmo-accent)_40%,transparent)] bg-osmo-accent text-[var(--osmo-accent-fg)]"
                  : "border-[var(--osmo-border)] bg-[var(--osmo-hover)] text-osmo-subtle",
                dia.hoje && !dia.ativo && "ring-1 ring-white/25",
              )}
            >
              {dia.ativo ? (
                <Check className="size-3.5" strokeWidth={2.5} />
              ) : (
                <span className="size-1.5 rounded-full bg-white/15" />
              )}
            </div>
            <span
              className={cn(
                "text-[8px] uppercase tracking-wide sm:text-[9px]",
                dia.hoje ? "text-osmo-muted" : "text-osmo-subtle",
              )}
            >
              {dia.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[var(--osmo-border)] pt-3 text-[11px] text-osmo-muted sm:mt-5 sm:flex-row sm:items-center sm:gap-4 sm:pt-4 sm:text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="size-3.5 text-osmo-accent" />
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
    </ProgressoCard>
  );
}
