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
    <ul className="divide-y divide-[var(--osmo-border)]">
      {fracos.map((assunto) => (
        <li key={assunto.assuntoId}>
          <Link
            href={`/simulados/treino/novo?assunto=${assunto.assuntoId}&quantidade=5&priorizar=1`}
            className="flex items-center justify-between gap-3 py-3 transition first:pt-0 last:pb-0 hover:opacity-90"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-osmo">{assunto.nome}</p>
              <p className="mt-0.5 text-[11px] text-osmo-subtle">
                {assunto.dominadas}/{assunto.disponiveis} questões
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm font-medium tabular-nums",
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
