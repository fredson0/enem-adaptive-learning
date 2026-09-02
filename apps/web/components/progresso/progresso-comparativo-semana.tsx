"use client";

import type { ComparativoSemanal } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

type ProgressoComparativoSemanaProps = {
  comparativo: ComparativoSemanal;
};

export function ProgressoComparativoSemana({
  comparativo,
}: ProgressoComparativoSemanaProps) {
  const {
    simuladosSemanaAtual,
    simuladosSemanaAnterior,
    mediaSemanaAtual,
    mediaSemanaAnterior,
    deltaMedia,
  } = comparativo;

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:gap-16">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-osmo-subtle">
          Esta semana
        </p>
        <p className="mt-2 text-4xl font-medium tabular-nums tracking-tight text-osmo sm:text-5xl">
          {simuladosSemanaAtual}
        </p>
        <p className="mt-1 text-sm text-osmo-muted">
          simulado{simuladosSemanaAtual === 1 ? "" : "s"}
          {mediaSemanaAtual !== null ? ` · média ${mediaSemanaAtual}%` : ""}
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-osmo-subtle">
          Semana passada
        </p>
        <p className="mt-2 text-4xl font-medium tabular-nums tracking-tight text-osmo sm:text-5xl">
          {simuladosSemanaAnterior}
        </p>
        <p className="mt-1 text-sm text-osmo-muted">
          simulado{simuladosSemanaAnterior === 1 ? "" : "s"}
          {mediaSemanaAnterior !== null
            ? ` · média ${mediaSemanaAnterior}%`
            : ""}
        </p>
      </div>

      {deltaMedia !== null ? (
        <p
          className={cn(
            "flex items-center gap-2 text-sm sm:col-span-2",
            deltaMedia > 0 && "text-osmo-accent",
            deltaMedia < 0 && "text-red-400",
            deltaMedia === 0 && "text-osmo-muted",
          )}
        >
          {deltaMedia > 0 ? (
            <TrendingUp className="size-4 shrink-0" />
          ) : deltaMedia < 0 ? (
            <TrendingDown className="size-4 shrink-0" />
          ) : null}
          <span>
            {deltaMedia > 0
              ? `+${deltaMedia}% na média vs semana passada`
              : deltaMedia < 0
                ? `${deltaMedia}% na média vs semana passada`
                : "Média estável em relação à semana passada"}
          </span>
        </p>
      ) : null}
    </div>
  );
}
