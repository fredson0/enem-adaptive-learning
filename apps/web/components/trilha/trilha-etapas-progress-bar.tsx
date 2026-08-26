"use client";

import type { TrilhaEtapa } from "@/lib/trilha";
import { cn } from "@/lib/utils";

type TrilhaEtapasProgressBarProps = {
  etapas: TrilhaEtapa[];
  proximaEtapaId?: string;
  className?: string;
};

export function TrilhaEtapasProgressBar({
  etapas,
  proximaEtapaId,
  className,
}: TrilhaEtapasProgressBarProps) {
  if (etapas.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2 gap-1 overflow-hidden rounded-full">
        {etapas.map((etapa) => {
          const isProxima =
            etapa.id === proximaEtapaId && !etapa.concluida;

          return (
            <div
              key={etapa.id}
              title={etapa.titulo}
              className={cn(
                "h-full flex-1 rounded-full transition-colors",
                etapa.concluida
                  ? "bg-osmo-accent"
                  : isProxima
                    ? "bg-[color-mix(in_srgb,var(--osmo-accent)_35%,transparent)]"
                    : "bg-[var(--osmo-border)]",
              )}
            />
          );
        })}
      </div>
      <p className="text-[11px] text-osmo-subtle">
        {etapas.filter((e) => e.concluida).length}/{etapas.length} etapas
        concluídas
      </p>
    </div>
  );
}
