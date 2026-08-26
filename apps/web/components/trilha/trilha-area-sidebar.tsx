"use client";

import { ProgressoCard } from "@/components/progresso/progresso-card";
import { ProgressRing } from "@/components/progresso/progress-ring";
import type { TrilhaArea, TrilhaResponse } from "@/lib/trilha";
import { AREA_CORES } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Target } from "lucide-react";
import { Loader2 } from "lucide-react";

const PRIORIDADE_STYLES = {
  Alta: "bg-red-500/15 text-red-500 dark:text-red-300",
  Média: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  Baixa: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
} as const;

type TrilhaAreaSidebarProps = {
  area: TrilhaArea;
  trilha: TrilhaResponse;
  progressoExibido: number;
  etapasConcluidas: number;
  totalEtapas: number;
  checklistArea: { id: string; texto: string; concluida: boolean }[];
  checklistConcluidos: number;
  metaArea: string | null;
  assuntoFocoNome?: string;
  coberturaAssunto?: {
    dominadas: number;
    disponiveis: number;
    tentadas: number;
    percentual: number;
  };
  onToggleChecklist?: (itemId: string, concluida: boolean) => Promise<void>;
  togglingChecklistId?: string | null;
};

export function TrilhaAreaSidebar({
  area,
  trilha,
  progressoExibido,
  etapasConcluidas,
  totalEtapas,
  checklistArea,
  checklistConcluidos,
  metaArea,
  assuntoFocoNome,
  coberturaAssunto,
  onToggleChecklist,
  togglingChecklistId = null,
}: TrilhaAreaSidebarProps) {
  const corArea = AREA_CORES[area.slug] ?? "var(--osmo-accent)";

  return (
    <aside className="space-y-3 sm:space-y-4 lg:sticky lg:top-28 lg:self-start">
      <ProgressoCard icon={<Target className="size-4" />} title="Seu progresso">
        <div className="flex items-center gap-3 sm:gap-4">
          <ProgressRing
            percent={progressoExibido}
            color={corArea}
            size={52}
            strokeWidth={3.5}
            className="sm:hidden"
          />
          <ProgressRing
            percent={progressoExibido}
            color={corArea}
            size={64}
            strokeWidth={4}
            className="hidden sm:block"
          />
          <div className="min-w-0">
            <p className="text-xl font-medium tabular-nums text-osmo sm:text-2xl">
              {progressoExibido}%
            </p>
            <p className="mt-0.5 text-xs text-osmo-subtle">
              {coberturaAssunto
                ? `${coberturaAssunto.dominadas}/${coberturaAssunto.disponiveis} questões dominadas`
                : `${etapasConcluidas}/${totalEtapas} etapas`}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 border-t border-[var(--osmo-border)] pt-4 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span className="text-osmo-muted">Prioridade</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                PRIORIDADE_STYLES[area.prioridade],
              )}
            >
              {area.prioridade}
            </span>
          </li>
          {area.proficienciaReal > 0 ? (
            <li className="flex items-center justify-between gap-2">
              <span className="text-osmo-muted">Simulados</span>
              <span className="tabular-nums text-osmo">
                {area.proficienciaReal}%
              </span>
            </li>
          ) : null}
          {checklistArea.length > 0 ? (
            <li className="flex items-center justify-between gap-2">
              <span className="text-osmo-muted">Checklist IA</span>
              <span className="tabular-nums text-osmo">
                {checklistConcluidos}/{checklistArea.length}
              </span>
            </li>
          ) : null}
        </ul>

        {trilha.metaEnem || metaArea ? (
          <div className="mt-4 space-y-1.5 border-t border-[var(--osmo-border)] pt-4">
            {trilha.metaEnem ? (
              <p className="text-xs leading-relaxed text-osmo-muted">
                <span className="text-osmo-accent">Objetivo:</span>{" "}
                {trilha.metaEnem}
              </p>
            ) : null}
            {metaArea ? (
              <p className="text-xs leading-relaxed text-osmo-subtle">{metaArea}</p>
            ) : null}
          </div>
        ) : null}
      </ProgressoCard>

      {checklistArea.length > 0 ? (
        <ProgressoCard
          icon={<Sparkles className="size-4 text-osmo-accent" />}
          title={assuntoFocoNome ? `Checklist · ${assuntoFocoNome}` : "Checklist IA"}
        >
          <ul className="space-y-2.5">
            {checklistArea.map((item) => {
              const toggling = togglingChecklistId === item.id;
              return (
                <li key={item.id} className="flex items-start gap-2.5">
                  <button
                    type="button"
                    disabled={toggling || !onToggleChecklist}
                    onClick={() =>
                      onToggleChecklist?.(item.id, !item.concluida)
                    }
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition",
                      item.concluida
                        ? "bg-[color-mix(in_srgb,var(--osmo-accent)_20%,transparent)] text-osmo-accent"
                        : "border border-[var(--osmo-border)] text-transparent hover:border-[color-mix(in_srgb,var(--osmo-accent)_40%,transparent)]",
                      toggling && "opacity-50",
                    )}
                  >
                    {toggling ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : item.concluida ? (
                      <Check className="size-3" strokeWidth={2.5} />
                    ) : null}
                  </button>
                  <span
                    className={cn(
                      "text-sm leading-snug",
                      item.concluida
                        ? "text-osmo-subtle line-through"
                        : "text-osmo-muted",
                    )}
                  >
                    {item.texto}
                  </span>
                </li>
              );
            })}
          </ul>
        </ProgressoCard>
      ) : null}
    </aside>
  );
}
