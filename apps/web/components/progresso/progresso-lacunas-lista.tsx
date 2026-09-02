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
    <ul className="divide-y divide-[var(--osmo-border)]">
      {lacunas.map((lacuna, index) => {
        const cor = AREA_CORES[lacuna.slug] ?? "var(--osmo-accent)";
        const href = `/simulados/treino/novo?area=${lacuna.simuladoSugerido.area}&quantidade=${lacuna.simuladoSugerido.quantidade}`;
        const ehPrincipal = destacarPrincipal && index === 0;

        return (
          <li key={lacuna.slug}>
            <Link
              href={href}
              className={cn(
                "group flex items-start gap-4 py-4 transition first:pt-0 last:pb-0 hover:opacity-90",
                ehPrincipal && "pt-0",
              )}
            >
              <span
                className="mt-0.5 w-10 shrink-0 text-lg font-medium tabular-nums tracking-tight"
                style={{ color: cor }}
              >
                {lacuna.score}%
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-medium text-osmo">{lacuna.label}</p>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-osmo-subtle">
                    {lacuna.prioridade}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-osmo-muted">
                  {lacuna.mensagem}
                </p>
                <p className="mt-1.5 text-[11px] text-osmo-subtle">
                  {lacuna.acertos}/{lacuna.totalQuestoes} acertos no banco
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-osmo-subtle transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
