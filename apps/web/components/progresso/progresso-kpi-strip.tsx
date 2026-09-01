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
        "-mx-4 flex gap-2 overflow-x-auto overflow-y-hidden px-4 pb-1 snap-x snap-mandatory scrollbar-none",
        "sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-[9.75rem] shrink-0 snap-start rounded-xl border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-3 py-3 sm:min-w-0 sm:rounded-2xl sm:px-4 sm:py-3.5"
        >
          <p className="truncate text-[10px] uppercase tracking-wide text-osmo-subtle">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 truncate text-lg font-medium tabular-nums tracking-tight sm:text-2xl",
              item.accent === "positive" && "text-osmo-accent",
              item.accent === "warning" && "text-amber-400/90",
              !item.accent || item.accent === "default" ? "text-osmo" : "",
            )}
            title={item.value}
          >
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-osmo-subtle sm:text-[11px]">
              {item.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
