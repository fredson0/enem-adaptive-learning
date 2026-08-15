"use client";

import type { PontoEvolucao } from "@/lib/metricas";
import {
  calcularTendenciaGeral,
  formatDateCurta,
} from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ProgressoEvolucaoChartProps = {
  pontos: PontoEvolucao[];
  compact?: boolean;
  variant?: "bar" | "line";
};

export function ProgressoEvolucaoChart({
  pontos,
  compact = false,
  variant = "bar",
}: ProgressoEvolucaoChartProps) {
  const [ativo, setAtivo] = useState<number | null>(null);

  const recentes = [...pontos]
    .sort(
      (a, b) =>
        new Date(a.finalizadoEm).getTime() - new Date(b.finalizadoEm).getTime(),
    )
    .slice(compact ? -6 : -8);

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

  const tendencia = calcularTendenciaGeral(pontos);
  const max = Math.max(...recentes.map((p) => p.percentual), 1);
  const ultimo = recentes[recentes.length - 1];

  if (variant === "line") {
    const width = 280;
    const height = compact ? 120 : 160;
    const padX = 12;
    const padY = 16;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const coords = recentes.map((ponto, index) => {
      const x =
        padX + (recentes.length === 1 ? chartW / 2 : (index / (recentes.length - 1)) * chartW);
      const y = padY + chartH - (ponto.percentual / 100) * chartH;
      return { x, y, ponto };
    });

    const linha = coords.map((c) => `${c.x},${c.y}`).join(" ");
    const pontoAtivo = ativo !== null ? coords[ativo] : null;

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/35">
              Último resultado
            </p>
            <p className="text-2xl font-medium tabular-nums text-white">
              {ultimo.percentual}%
            </p>
          </div>
          {tendencia !== null && tendencia !== 0 ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                tendencia > 0
                  ? "bg-[#b0ff57]/15 text-[#b0ff57]"
                  : "bg-red-500/15 text-red-300",
              )}
            >
              {tendencia > 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {tendencia > 0 ? "+" : ""}
              {tendencia}% vs anterior
            </span>
          ) : null}
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            onMouseLeave={() => setAtivo(null)}
          >
            {[0, 25, 50, 75, 100].map((nivel) => {
              const y = padY + chartH - (nivel / 100) * chartH;
              return (
                <line
                  key={nivel}
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 4"
                />
              );
            })}

            <polyline
              points={linha}
              fill="none"
              stroke="#b0ff57"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {coords.map((coord, index) => (
              <g key={coord.ponto.simuladoId}>
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={ativo === index ? 6 : 4}
                  fill={ativo === index ? "#b0ff57" : "#161616"}
                  stroke="#b0ff57"
                  strokeWidth={2}
                  className="cursor-pointer"
                  onMouseEnter={() => setAtivo(index)}
                />
              </g>
            ))}

            {pontoAtivo ? (
              <>
                <line
                  x1={pontoAtivo.x}
                  y1={padY}
                  x2={pontoAtivo.x}
                  y2={padY + chartH}
                  stroke="rgba(255,255,255,0.15)"
                  strokeDasharray="3 3"
                />
              </>
            ) : null}
          </svg>

          {pontoAtivo ? (
            <div
              className="pointer-events-none absolute rounded-full border border-white/10 bg-[#1a1a1a] px-2.5 py-1 text-[10px] text-white/80 shadow-lg"
              style={{
                left: `${(pontoAtivo.x / width) * 100}%`,
                top: `${(pontoAtivo.y / height) * 100}%`,
                transform: "translate(-50%, -130%)",
              }}
            >
              {pontoAtivo.ponto.percentual}% ·{" "}
              {formatDateCurta(pontoAtivo.ponto.finalizadoEm)}
            </div>
          ) : null}
        </div>

        <div className="flex justify-between gap-1 px-1">
          {recentes.map((ponto) => (
            <span
              key={ponto.simuladoId}
              className="flex-1 truncate text-center text-[9px] text-white/30"
            >
              {formatDateCurta(ponto.finalizadoEm)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-end gap-2 sm:gap-3",
          compact ? "h-28" : "h-44",
        )}
      >
        {recentes.map((ponto) => (
          <div
            key={ponto.simuladoId}
            className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "font-medium text-white/70",
                compact ? "text-[10px]" : "text-[11px]",
              )}
            >
              {ponto.percentual}%
            </span>
            <div
              className="w-full rounded-t-md bg-white/25 transition group-hover:bg-white/90"
              style={{
                height: `${Math.max((ponto.percentual / max) * 100, 10)}%`,
              }}
              title={`${ponto.label ?? "Geral"} — ${ponto.acertos}/${ponto.totalQuestoes}`}
            />
            <span
              className={cn(
                "truncate text-white/35",
                compact ? "text-[9px]" : "text-[10px]",
              )}
            >
              {formatDateCurta(ponto.finalizadoEm)}
            </span>
          </div>
        ))}
      </div>
      {!compact ? (
        <p className="text-[11px] text-white/30">
          Últimos {recentes.length} simulados · passe o mouse para ver detalhes
        </p>
      ) : null}
    </div>
  );
}
