"use client";

import type { CoberturaAno } from "@/lib/metricas";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

type ProgressoEnemAnosProps = {
  anos: CoberturaAno[];
};

export function ProgressoEnemAnos({ anos }: ProgressoEnemAnosProps) {
  if (anos.length === 0) return null;

  const anosOrdenados = [...anos].sort((a, b) => b.ano - a.ano);
  const completos = anosOrdenados.filter((item) => item.completo).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-osmo-subtle sm:text-xs">
          {completos}/{anosOrdenados.length} provas com 100% de cobertura
        </p>
        <span className="inline-flex items-center gap-1 text-[10px] text-osmo-accent">
          <Sparkles className="size-3" />
          Complete todos os anos
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
        {anosOrdenados.map((item) => {
          const href = `/simulados/treino/novo?ano=${item.ano}&quantidade=10&priorizar=1`;
          const temProgresso = item.dominadas > 0;

          return (
            <Link
              key={item.ano}
              href={href}
              title={`${item.dominadas}/${item.disponiveis} dominadas (${item.percentual}%)`}
              className={cn(
                "group relative flex flex-col items-center rounded-lg border px-1 py-2 transition sm:rounded-xl sm:py-2.5",
                item.completo
                  ? "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400/50"
                  : temProgresso
                    ? "border-[var(--osmo-border)] bg-[var(--osmo-hover)] hover:border-[color-mix(in_srgb,var(--osmo-text)_15%,transparent)]"
                    : "border-[var(--osmo-border)] bg-[var(--osmo-surface)] hover:border-[color-mix(in_srgb,var(--osmo-text)_12%,transparent)]",
              )}
            >
              {item.completo ? (
                <Check className="absolute right-1 top-1 size-2.5 text-emerald-400 sm:size-3" />
              ) : null}
              <span className="text-[11px] font-medium text-osmo sm:text-xs">
                {item.ano}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[9px] tabular-nums sm:text-[10px]",
                  item.completo
                    ? "text-emerald-600 dark:text-emerald-300/90"
                    : temProgresso
                      ? "text-osmo-muted"
                      : "text-osmo-subtle",
                )}
              >
                {item.percentual}%
              </span>
              <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-[var(--osmo-border)]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    item.completo ? "bg-emerald-400" : "bg-osmo-accent",
                  )}
                  style={{ width: `${Math.min(100, item.percentual)}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
