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
        "grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-[var(--osmo-border)]",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 sm:px-6 sm:first:pl-0 sm:last:pr-0">
          <p className="truncate text-[11px] uppercase tracking-[0.16em] text-osmo-subtle">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1.5 truncate text-2xl font-medium tabular-nums tracking-tight sm:text-3xl lg:text-4xl",
              item.accent === "positive" && "text-osmo-accent",
              item.accent === "warning" && "text-amber-400/90",
              !item.accent || item.accent === "default" ? "text-osmo" : "",
            )}
            title={item.value}
          >
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-osmo-subtle sm:text-xs">
              {item.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
