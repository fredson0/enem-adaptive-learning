"use client";

import { TrilhaPlanoSemanalCard } from "@/components/trilha/trilha-plano-semanal-card";
import type { TrilhaResponse } from "@/lib/trilha";
import { ChevronRight, Route } from "lucide-react";
import Link from "next/link";

type ProgressoTrilhaResumoProps = {
  trilha: TrilhaResponse | null;
  onTrilhaAtualizada?: (trilha: TrilhaResponse) => void;
};

export function ProgressoTrilhaResumo({
  trilha,
  onTrilhaAtualizada,
}: ProgressoTrilhaResumoProps) {
  if (!trilha?.areas?.length) {
    return (
      <p className="text-sm text-osmo-muted">
        Complete o diagnóstico da trilha para ver etapas personalizadas.
      </p>
    );
  }

  const areaPrioritaria =
    trilha.areas.find((area) => area.slug === trilha.areaPrioritaria) ??
    trilha.areas[0];

  const etapasPendentes = areaPrioritaria.etapas.filter((e) => !e.concluida);

  return (
    <div className="space-y-4">
      <TrilhaPlanoSemanalCard
        trilha={trilha}
        onTrilhaAtualizada={onTrilhaAtualizada}
        compact
        embedded
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-osmo">
          {areaPrioritaria.label}
        </p>
        <span className="text-xs tabular-nums text-osmo-subtle">
          {areaPrioritaria.progresso}% da trilha
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--osmo-border)]">
        <div
          className="h-full rounded-full bg-osmo-accent transition-all"
          style={{ width: `${Math.min(100, areaPrioritaria.progresso)}%` }}
        />
      </div>

      {trilha.checklistIa.length === 0 && etapasPendentes.length > 0 ? (
        <>
          <p className="text-[10px] uppercase tracking-wide text-osmo-subtle">
            Etapas pendentes
          </p>
          <ul className="space-y-2">
            {etapasPendentes.slice(0, 4).map((etapa) => (
              <li key={etapa.id}>
                {etapa.href ? (
                  <Link
                    href={etapa.href}
                    className="flex items-start gap-2.5 rounded-lg border border-[var(--osmo-border)] bg-[var(--osmo-surface)] px-3 py-2.5 transition hover:bg-[var(--osmo-hover)]"
                  >
                    <Route className="mt-0.5 size-4 shrink-0 text-osmo-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-osmo">{etapa.titulo}</p>
                      <p className="mt-0.5 text-[11px] text-osmo-subtle">
                        {etapa.descricao}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-osmo-subtle" />
                  </Link>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-[var(--osmo-border)] px-3 py-2.5">
                    <Route className="mt-0.5 size-4 shrink-0 text-osmo-subtle" />
                    <div>
                      <p className="text-sm text-osmo-muted">{etapa.titulo}</p>
                      <p className="mt-0.5 text-[11px] text-osmo-subtle">
                        {etapa.descricao}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Link
        href={`/trilha/${areaPrioritaria.slug}`}
        className="inline-flex items-center gap-1 text-sm text-osmo-subtle transition hover:text-osmo"
      >
        Abrir trilha completa
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
