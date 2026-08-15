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
                  ? "bg-[#b0ff57]"
                  : isProxima
                    ? "bg-[#b0ff57]/35"
                    : "bg-white/[0.08]",
              )}
            />
          );
        })}
      </div>
      <p className="text-[11px] text-white/35">
        {etapas.filter((e) => e.concluida).length}/{etapas.length} etapas
        concluídas
      </p>
    </div>
  );
}
