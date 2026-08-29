"use client";

import type { PontoEvolucao } from "@/lib/metricas";
import { formatDateCurta } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type ProgressoHistoricoRecenteProps = {
  pontos: PontoEvolucao[];
  limit?: number;
};

export function ProgressoHistoricoRecente({
  pontos,
  limit = 5,
}: ProgressoHistoricoRecenteProps) {
  const recentes = [...pontos]
    .sort(
      (a, b) =>
        new Date(b.finalizadoEm).getTime() - new Date(a.finalizadoEm).getTime(),
    )
    .slice(0, limit);

  if (recentes.length === 0) {
    return (
      <p className="text-sm text-osmo-muted">
        Nenhum simulado concluído ainda. Comece com um treino de 5 questões.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--osmo-border)]">
      {recentes.map((ponto) => (
        <li key={ponto.simuladoId}>
          <Link
            href={`/simulados/${ponto.simuladoId}/resultado`}
            className="flex items-center gap-3 py-3 transition first:pt-0 last:pb-0 hover:opacity-90"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-osmo">
                {ponto.label ?? "Simulado geral"}
              </p>
              <p className="mt-0.5 text-[11px] text-osmo-subtle">
                {formatDateCurta(ponto.finalizadoEm)} · {ponto.acertos}/
                {ponto.totalQuestoes} acertos
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  ponto.percentual >= 70
                    ? "text-osmo-accent"
                    : ponto.percentual >= 50
                      ? "text-osmo"
                      : "text-amber-400/90",
                )}
              >
                {ponto.percentual}%
              </span>
              <ChevronRight className="size-4 text-osmo-subtle" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
