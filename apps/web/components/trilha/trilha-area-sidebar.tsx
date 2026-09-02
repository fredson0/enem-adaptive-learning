"use client";

import { AREA_CORES } from "@/lib/progresso-helpers";
import type { TrilhaArea, TrilhaResponse } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

const PRIORIDADE_TEXT = {
  Alta: "text-red-400",
  Média: "text-amber-400",
  Baixa: "text-osmo-accent",
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
    <aside className="min-w-0 space-y-10 lg:sticky lg:top-28 lg:self-start lg:space-y-12">
      <section>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-osmo-subtle">
          Seu progresso
        </p>
        <p
          className="mt-3 text-5xl font-medium tabular-nums tracking-tight sm:text-6xl"
          style={{ color: corArea }}
        >
          {progressoExibido}%
        </p>
        <p className="mt-2 text-sm text-osmo-muted">
          {coberturaAssunto
            ? `${coberturaAssunto.dominadas}/${coberturaAssunto.disponiveis} questões dominadas`
            : `${etapasConcluidas}/${totalEtapas} etapas`}
        </p>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-osmo-subtle">Prioridade</dt>
            <dd className={cn("uppercase tracking-[0.14em]", PRIORIDADE_TEXT[area.prioridade])}>
              {area.prioridade}
            </dd>
          </div>
          {area.proficienciaReal > 0 ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-osmo-subtle">Simulados</dt>
              <dd className="tabular-nums text-osmo">{area.proficienciaReal}%</dd>
            </div>
          ) : null}
          {checklistArea.length > 0 ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-osmo-subtle">Checklist</dt>
              <dd className="tabular-nums text-osmo">
                {checklistConcluidos}/{checklistArea.length}
              </dd>
            </div>
          ) : null}
        </dl>

        {trilha.metaEnem || metaArea ? (
          <div className="mt-6 space-y-2 border-t border-[var(--osmo-border)] pt-5">
            {trilha.metaEnem ? (
              <p className="text-sm leading-relaxed text-osmo-muted">
                <span className="text-osmo-subtle">Objetivo · </span>
                {trilha.metaEnem}
              </p>
            ) : null}
            {metaArea ? (
              <p className="text-sm leading-relaxed wrap-break-word text-osmo-subtle">
                {metaArea}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {checklistArea.length > 0 ? (
        <section>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-osmo-subtle">
            {assuntoFocoNome ? `Checklist · ${assuntoFocoNome}` : "Checklist"}
          </p>
          <ul className="mt-5 space-y-3">
            {checklistArea.map((item) => {
              const toggling = togglingChecklistId === item.id;
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <button
                    type="button"
                    disabled={toggling || !onToggleChecklist}
                    onClick={() => onToggleChecklist?.(item.id, !item.concluida)}
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
                      "min-w-0 flex-1 text-sm leading-snug wrap-break-word",
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
        </section>
      ) : null}
    </aside>
  );
}
