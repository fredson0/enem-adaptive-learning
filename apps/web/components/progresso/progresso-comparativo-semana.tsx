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
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-[var(--osmo-border)] bg-[var(--osmo-hover)] p-4">
        <p className="text-[10px] uppercase tracking-wide text-osmo-subtle">
          Esta semana
        </p>
        <p className="mt-2 text-2xl font-medium tabular-nums text-osmo">
          {simuladosSemanaAtual}
          <span className="ml-1 text-sm font-normal text-osmo-subtle">
            simulado{simuladosSemanaAtual === 1 ? "" : "s"}
          </span>
        </p>
        {mediaSemanaAtual !== null ? (
          <p className="mt-1 text-sm text-osmo-muted">
            Média {mediaSemanaAtual}%
          </p>
        ) : (
          <p className="mt-1 text-sm text-osmo-subtle">Sem simulados ainda</p>
        )}
      </div>

      <div className="rounded-xl border border-[var(--osmo-border)] bg-[var(--osmo-hover)] p-4">
        <p className="text-[10px] uppercase tracking-wide text-osmo-subtle">
          Semana passada
        </p>
        <p className="mt-2 text-2xl font-medium tabular-nums text-osmo">
          {simuladosSemanaAnterior}
          <span className="ml-1 text-sm font-normal text-osmo-subtle">
            simulado{simuladosSemanaAnterior === 1 ? "" : "s"}
          </span>
        </p>
        {mediaSemanaAnterior !== null ? (
          <p className="mt-1 text-sm text-osmo-muted">
            Média {mediaSemanaAnterior}%
          </p>
        ) : (
          <p className="mt-1 text-sm text-osmo-subtle">Sem simulados</p>
        )}
      </div>

      {deltaMedia !== null ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm sm:col-span-2",
            deltaMedia > 0
              ? "border-[color-mix(in_srgb,var(--osmo-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--osmo-accent)_8%,transparent)] text-osmo-accent"
              : deltaMedia < 0
                ? "border-red-500/20 bg-red-500/10 text-red-400"
                : "border-[var(--osmo-border)] bg-[var(--osmo-hover)] text-osmo-muted",
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
        </div>
      ) : null}
    </div>
  );
}
