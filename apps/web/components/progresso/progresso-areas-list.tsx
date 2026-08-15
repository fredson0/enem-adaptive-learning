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
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#b0ff57]">
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
    <ul className="divide-y divide-white/[0.06]">
      {areas.map((area) => {
        const cor = AREA_CORES[area.slug] ?? "#b0ff57";
        const sigla = AREA_SIGLAS[area.slug] ?? "—";
        const ehPrioridade = lacunaSlug === area.slug;
        const semPratica = area.totalQuestoes === 0;
        const tendencia = tendencias.get(area.slug) ?? null;

        return (
          <li key={area.area}>
            <Link
              href={`/trilha/${area.slug}`}
              className={cn(
                "flex items-center gap-3 py-3.5 transition first:pt-0 last:pb-0",
                ehPrioridade && "rounded-xl bg-white/[0.03] px-2 -mx-2",
              )}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold tracking-wide"
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
                      "truncate text-sm",
                      ehPrioridade
                        ? "font-medium text-white"
                        : "text-white/75",
                    )}
                  >
                    {area.label}
                  </p>
                  {ehPrioridade ? (
                    <span className="rounded-full bg-[#b0ff57]/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#b0ff57]">
                      Foco
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-white/35">
                  {semPratica
                    ? "Sem prática ainda"
                    : `${area.acertos}/${area.totalQuestoes} acertos`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="flex flex-col items-end gap-0.5">
                  <TendenciaMini valor={tendencia} />
                </div>
                <ProgressRing
                  percent={area.score}
                  color={cor}
                  empty={semPratica}
                  size={44}
                  strokeWidth={3}
                />
                <ChevronRight className="size-4 text-white/20" />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
