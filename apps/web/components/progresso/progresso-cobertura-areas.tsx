"use client";

import type { CoberturaArea } from "@/lib/metricas";
import { AREA_CORES } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProgressoCoberturaAreasProps = {
  areas: CoberturaArea[];
};

export function ProgressoCoberturaAreas({ areas }: ProgressoCoberturaAreasProps) {
  if (areas.length === 0) {
    return (
      <p className="text-sm text-osmo-muted">
        Faça simulados para mapear sua cobertura por área.
      </p>
    );
  }

  const ordenadas = [...areas].sort((a, b) => a.percentual - b.percentual);

  return (
    <ul className="space-y-3">
      {ordenadas.map((area) => {
        const cor = AREA_CORES[area.slug] ?? "var(--osmo-accent)";

        return (
          <li key={area.slug}>
            <Link
              href={`/trilha/${area.slug}`}
              className="block rounded-xl border border-transparent p-2 transition hover:border-[var(--osmo-border)] hover:bg-[var(--osmo-hover)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm text-osmo">{area.label}</p>
                <span className="shrink-0 text-xs tabular-nums text-osmo-muted">
                  {area.dominadas}/{area.disponiveis}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--osmo-border)]">
                <div
                  className={cn("h-full rounded-full transition-all")}
                  style={{
                    width: `${Math.min(100, area.percentual)}%`,
                    backgroundColor: cor,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-osmo-subtle">
                {area.percentual}% do banco dominado
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
