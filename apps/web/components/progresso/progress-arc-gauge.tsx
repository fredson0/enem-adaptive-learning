"use client";

import { cn } from "@/lib/utils";

type ProgressArcGaugeProps = {
  percent: number;
  className?: string;
  ticks?: number;
  labelLeft?: string;
  labelRight?: string;
};

/** Semi-circular tick gauge inspired by Osmo course progress. */
export function ProgressArcGauge({
  percent,
  className,
  ticks = 44,
  labelLeft,
  labelRight,
}: ProgressArcGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const filled = Math.round((clamped / 100) * ticks);
  const cx = 140;
  const cy = 132;
  const radius = 108;

  return (
    <div className={cn("relative mx-auto w-full max-w-[220px] sm:max-w-[280px]", className)}>
      <svg viewBox="0 0 280 150" className="h-auto w-full" aria-hidden>
        {Array.from({ length: ticks }).map((_, index) => {
          const t = ticks <= 1 ? 0 : index / (ticks - 1);
          const angle = Math.PI - t * Math.PI;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const x1 = cx + cos * radius;
          const y1 = cy - sin * radius;
          const x2 = cx + cos * (radius - 14);
          const y2 = cy - sin * (radius - 14);
          const active = index <= filled;

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={active ? "var(--osmo-text)" : "var(--osmo-border)"}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-[36%] flex justify-center sm:top-[38%]">
        <div className="flex max-w-[92%] items-center">
          <span className="truncate rounded-l-full bg-[var(--osmo-text)] px-2 py-1 text-xs font-medium text-[var(--osmo-canvas)] sm:px-3 sm:py-1.5 sm:text-sm">
            {labelLeft ?? `${clamped}%`}
          </span>
          <span className="truncate rounded-r-full bg-[var(--osmo-hover)] px-2 py-1 text-xs font-medium text-osmo-muted sm:px-3 sm:py-1.5 sm:text-sm">
            {labelRight ?? (clamped >= 100 ? "Concluída" : "Em andamento")}
          </span>
        </div>
      </div>
    </div>
  );
}
