"use client";

import { ProgressRing } from "@/components/progresso/progress-ring";
import type { ProficienciaArea } from "@/lib/metricas";
import {
  AREA_CORES,
  AREA_SIGLAS,
  type TendenciaArea,
} from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

function TendenciaMini({ valor }: { valor: TendenciaArea }) {
  if (valor === null) return null;
  if (valor > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-osmo-accent">
        <TrendingUp className="size-2.5" />+{valor}%
      </span>
    );
  }
  if (valor < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-400/90">
        <TrendingDown className="size-2.5" />
        {valor}%
      </span>
    );
  }
  return null;
}

type ProgressoAreasListProps = {
  areas: ProficienciaArea[];
  lacunaSlug: string | null;
  tendencias: Map<string, TendenciaArea>;
};

export function ProgressoAreasList({
  areas,
  lacunaSlug,
  tendencias,
}: ProgressoAreasListProps) {
  return (
    <ul className="divide-y divide-[var(--osmo-border)]">
      {areas.map((area) => {
        const cor = AREA_CORES[area.slug] ?? "var(--osmo-accent)";
        const sigla = AREA_SIGLAS[area.slug] ?? "—";
        const ehPrioridade = lacunaSlug === area.slug;
        const semPratica = area.acertos === 0;
        const tendencia = tendencias.get(area.slug) ?? null;

        const subtitulo =
          semPratica && area.totalQuestoes > 0
            ? "Sem prática ainda"
            : semPratica
              ? "Sem questões no banco"
              : `${area.acertos}/${area.totalQuestoes} dominadas`;

        return (
          <li key={area.area}>
            <Link
              href={`/trilha/${area.slug}`}
              className={cn(
                "flex items-center gap-2.5 py-2.5 transition first:pt-0 last:pb-0 sm:gap-3 sm:py-3.5",
                ehPrioridade &&
                  "rounded-xl bg-[var(--osmo-hover)] px-2 -mx-2",
              )}
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-semibold tracking-wide sm:size-9 sm:text-[10px]"
                style={{
                  backgroundColor: `${cor}22`,
                  color: cor,
                }}
              >
                {sigla}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-[13px] sm:text-sm",
                      ehPrioridade
                        ? "font-medium text-osmo"
                        : "text-osmo-muted",
                    )}
                  >
                    {area.label}
                  </p>
                  {ehPrioridade ? (
                    <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--osmo-accent)_15%,transparent)] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-osmo-accent sm:text-[9px]">
                      Foco
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[10px] text-osmo-subtle sm:text-[11px]">
                  {subtitulo}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <div className="hidden flex-col items-end gap-0.5 sm:flex">
                  <TendenciaMini valor={tendencia} />
                </div>
                <ProgressRing
                  percent={area.score}
                  color={cor}
                  empty={semPratica}
                  size={38}
                  strokeWidth={2.75}
                  className="sm:hidden"
                />
                <ProgressRing
                  percent={area.score}
                  color={cor}
                  empty={semPratica}
                  size={44}
                  strokeWidth={3}
                  className="hidden sm:block"
                />
                <ChevronRight className="hidden size-4 text-osmo-subtle sm:block" />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
