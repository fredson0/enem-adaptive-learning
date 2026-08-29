"use client";

import type { LacunaTrilha } from "@/lib/metricas";
import { AREA_CORES } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type ProgressoLacunasListaProps = {
  lacunas: LacunaTrilha[];
  destacarPrincipal?: boolean;
};

export function ProgressoLacunasLista({
  lacunas,
  destacarPrincipal = true,
}: ProgressoLacunasListaProps) {
  if (lacunas.length === 0) {
    return (
      <p className="text-sm text-osmo-muted">
        Nenhuma lacuna identificada ainda. Complete mais questões para priorizar
        o que revisar.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {lacunas.map((lacuna, index) => {
        const cor = AREA_CORES[lacuna.slug] ?? "var(--osmo-accent)";
        const href = `/simulados/treino/novo?area=${lacuna.simuladoSugerido.area}&quantidade=${lacuna.simuladoSugerido.quantidade}`;
        const ehPrincipal = destacarPrincipal && index === 0;

        return (
          <li key={lacuna.slug}>
            <Link
              href={href}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 transition sm:p-4",
                ehPrincipal
                  ? "border-[color-mix(in_srgb,var(--osmo-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--osmo-accent)_6%,transparent)]"
                  : "border-[var(--osmo-border)] bg-[var(--osmo-hover)] hover:border-[color-mix(in_srgb,var(--osmo-text)_12%,transparent)]",
              )}
            >
              <div
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold"
                style={{ backgroundColor: `${cor}22`, color: cor }}
              >
                {lacuna.score}%
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-osmo">{lacuna.label}</p>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wide text-osmo-subtle">
                    {lacuna.prioridade}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-osmo-muted">
                  {lacuna.mensagem}
                </p>
                <p className="mt-2 text-[11px] text-osmo-subtle">
                  {lacuna.acertos}/{lacuna.totalQuestoes} acertos no banco
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-osmo-subtle" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
