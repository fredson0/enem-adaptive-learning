"use client";

import type { PontoEvolucao } from "@/lib/metricas";
import { formatDateCurta } from "@/lib/progresso-helpers";
import Link from "next/link";

type ProgressoEvolucaoChartProps = {
  pontos: PontoEvolucao[];
};

export function ProgressoEvolucaoChart({ pontos }: ProgressoEvolucaoChartProps) {
  const recentes = [...pontos]
    .sort(
      (a, b) =>
        new Date(a.finalizadoEm).getTime() - new Date(b.finalizadoEm).getTime(),
    )
    .slice(-8);

  if (recentes.length < 3) {
    return (
      <div className="rounded-[14px] border border-dashed border-white/10 bg-[#161616]/50 p-8 text-center">
        <p className="text-sm text-white/50">
          Complete mais {3 - recentes.length} simulado
          {3 - recentes.length === 1 ? "" : "s"} para ver sua evolução.
        </p>
        <Link
          href="/simulados/treino/novo"
          className="mt-4 inline-flex rounded-full bg-[#b0ff57] px-5 py-2 text-sm font-medium text-black transition hover:bg-[#c4ff7a]"
        >
          Fazer treino de 5 questões
        </Link>
      </div>
    );
  }

  const max = Math.max(...recentes.map((p) => p.percentual), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {recentes.map((ponto) => (
          <div
            key={ponto.simuladoId}
            className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span className="text-[11px] font-medium text-white/70">
              {ponto.percentual}%
            </span>
            <div
              className="w-full rounded-t-md bg-white/25 transition group-hover:bg-white/90"
              style={{
                height: `${Math.max((ponto.percentual / max) * 100, 10)}%`,
              }}
              title={`${ponto.label ?? "Geral"} — ${ponto.acertos}/${ponto.totalQuestoes}`}
            />
            <span className="truncate text-[10px] text-white/35">
              {formatDateCurta(ponto.finalizadoEm)}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-white/30">
        Últimos {recentes.length} simulados · passe o mouse para ver detalhes
      </p>
    </div>
  );
}
