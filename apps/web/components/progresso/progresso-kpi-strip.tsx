import { cn } from "@/lib/utils";

export type ProgressoKpi = {
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "positive" | "warning";
};

type ProgressoKpiStripProps = {
  items: ProgressoKpi[];
  className?: string;
};

export function ProgressoKpiStrip({ items, className }: ProgressoKpiStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-3.5"
        >
          <p className="text-[10px] uppercase tracking-wide text-osmo-subtle">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-medium tabular-nums tracking-tight sm:text-2xl",
              item.accent === "positive" && "text-osmo-accent",
              item.accent === "warning" && "text-amber-400/90",
              !item.accent || item.accent === "default"
                ? "text-osmo"
                : "",
            )}
          >
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-0.5 text-[10px] leading-snug text-osmo-subtle sm:text-[11px]">
              {item.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
