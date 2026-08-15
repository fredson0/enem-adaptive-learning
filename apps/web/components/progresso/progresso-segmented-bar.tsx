"use client";

import type { SegmentoArea } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";

type ProgressoSegmentedBarProps = {
  segmentos: SegmentoArea[];
  total: number;
  className?: string;
};

export function ProgressoSegmentedBar({
  segmentos,
  total,
  className,
}: ProgressoSegmentedBarProps) {
  if (total === 0 || segmentos.length === 0) {
    return (
      <div
        className={cn(
          "h-3 rounded-full border border-dashed border-white/10 bg-white/[0.03]",
          className,
        )}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-3 overflow-hidden rounded-full">
        {segmentos.map((segmento) => {
          const width = (segmento.valor / total) * 100;
          if (width <= 0) return null;

          return (
            <div
              key={segmento.slug}
              className="h-full transition-[width]"
              style={{
                width: `${width}%`,
                backgroundColor: segmento.cor,
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.12) 4px, rgba(0,0,0,0.12) 8px)",
              }}
              title={`${segmento.label}: ${segmento.valor} questões`}
            />
          );
        })}
      </div>

      <ul className="space-y-1.5 sm:space-y-2">
        {segmentos.map((segmento) => (
          <li
            key={segmento.slug}
            className="flex items-center justify-between gap-2 text-xs sm:gap-3 sm:text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-white/65">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: segmento.cor }}
              />
              <span className="truncate">{segmento.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-white/40">
              {segmento.valor} questões
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
