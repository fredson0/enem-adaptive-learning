"use client";

import type { CoberturaAssunto } from "@/lib/metricas";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProgressoAssuntosFracosProps = {
  assuntos: CoberturaAssunto[];
  limit?: number;
};

export function ProgressoAssuntosFracos({
  assuntos,
  limit = 6,
}: ProgressoAssuntosFracosProps) {
  const fracos = [...assuntos]
    .filter((item) => item.disponiveis > 0)
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, limit);

  if (fracos.length === 0) {
    return (
      <p className="text-sm text-osmo-muted">
        Ainda não há assuntos mapeados. Continue treinando para identificar lacunas
        específicas.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {fracos.map((assunto) => (
        <li key={assunto.assuntoId}>
          <Link
            href={`/simulados/treino/novo?assunto=${assunto.assuntoId}&quantidade=5&priorizar=1`}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-3 py-2.5 transition hover:border-[color-mix(in_srgb,var(--osmo-text)_15%,transparent)]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-osmo">{assunto.nome}</p>
              <p className="mt-0.5 text-[10px] text-osmo-subtle">
                {assunto.dominadas}/{assunto.disponiveis} questões
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-xs font-medium tabular-nums",
                assunto.percentual < 30
                  ? "text-amber-400/90"
                  : "text-osmo-muted",
              )}
            >
              {assunto.percentual}%
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
