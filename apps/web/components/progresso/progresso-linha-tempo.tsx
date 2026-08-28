"use client";

import type { DiaLinhaTempo } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";

type ProgressoLinhaTempoProps = {
  dias: DiaLinhaTempo[];
};

export function ProgressoLinhaTempo({ dias }: ProgressoLinhaTempoProps) {
  const maxSimulados = Math.max(...dias.map((dia) => dia.simulados), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-[3px] overflow-x-auto pb-1">
        {dias.map((dia) => {
          const altura =
            dia.simulados > 0
              ? Math.max((dia.simulados / maxSimulados) * 100, 18)
              : 8;

          return (
            <div
              key={dia.data}
              className="group flex min-w-[10px] flex-1 flex-col items-center gap-1"
              title={
                dia.ativo
                  ? `${dia.simulados} simulado(s) · média ${dia.mediaPercentual}%`
                  : "Sem prática"
              }
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-colors",
                  dia.ativo
                    ? "bg-[color-mix(in_srgb,var(--osmo-accent)_55%,transparent)] group-hover:bg-osmo-accent"
                    : "bg-[var(--osmo-border)]",
                )}
                style={{ height: `${altura}px` }}
              />
              {dia.label.endsWith("01") || dia.label.endsWith("15") ? (
                <span className="text-[8px] text-osmo-subtle">{dia.label}</span>
              ) : (
                <span className="text-[8px] text-transparent">{dia.label}</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-osmo-subtle">
        Últimos 30 dias · passe o mouse para ver detalhes
      </p>
    </div>
  );
}
