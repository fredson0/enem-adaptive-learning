"use client";

import { ProgressoCard } from "@/components/progresso/progresso-card";
import type { ProficienciaArea } from "@/lib/metricas";
import {
  AREA_CORES,
  AREA_ORDEM_RADAR,
  AREA_SIGLAS,
} from "@/lib/progresso-helpers";
import { Radar } from "lucide-react";

type ProgressoRadarChartProps = {
  areas: ProficienciaArea[];
};

function pontoNoEixo(
  indice: number,
  valor: number,
  raioMax: number,
  cx: number,
  cy: number,
  total: number,
) {
  const angulo = (Math.PI * 2 * indice) / total - Math.PI / 2;
  const raio = (Math.max(0, Math.min(100, valor)) / 100) * raioMax;
  return {
    x: cx + raio * Math.cos(angulo),
    y: cy + raio * Math.sin(angulo),
  };
}

export function ProgressoRadarChart({ areas }: ProgressoRadarChartProps) {
  const porSlug = new Map(areas.map((area) => [area.slug, area]));
  const valores = AREA_ORDEM_RADAR.map((slug) => {
    const area = porSlug.get(slug);
    return area && area.totalQuestoes > 0 ? area.score : 0;
  });

  const cx = 120;
  const cy = 120;
  const raioMax = 72;
  const total = AREA_ORDEM_RADAR.length;
  const temDados = valores.some((valor) => valor > 0);

  const pontosData = valores
    .map((valor, indice) =>
      pontoNoEixo(indice, valor, raioMax, cx, cy, total),
    )
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const niveis = [25, 50, 75, 100];

  return (
    <ProgressoCard icon={<Radar className="size-4" />} title="Mapa ENEM">
      {!temDados ? (
        <p className="py-8 text-center text-sm text-white/40">
          Faça treinos em diferentes áreas para ver seu mapa.
        </p>
      ) : (
        <div className="relative mx-auto w-full max-w-[200px] sm:max-w-[260px]">
          <svg viewBox="0 0 240 240" className="h-auto w-full" aria-hidden>
            {niveis.map((nivel) => {
              const pontos = Array.from({ length: total }, (_, indice) =>
                pontoNoEixo(indice, nivel, raioMax, cx, cy, total),
              );
              const d = `${pontos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")} Z`;

              return (
                <path
                  key={nivel}
                  d={d}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                />
              );
            })}

            {AREA_ORDEM_RADAR.map((slug, indice) => {
              const fim = pontoNoEixo(indice, 100, raioMax, cx, cy, total);
              return (
                <line
                  key={slug}
                  x1={cx}
                  y1={cy}
                  x2={fim.x}
                  y2={fim.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
              );
            })}

            <polygon
              points={pontosData}
              fill="rgba(176,255,87,0.15)"
              stroke="#b0ff57"
              strokeWidth={2}
            />

            {valores.map((valor, indice) => {
              if (valor <= 0) return null;
              const p = pontoNoEixo(indice, valor, raioMax, cx, cy, total);
              const cor = AREA_CORES[AREA_ORDEM_RADAR[indice]] ?? "#b0ff57";
              return (
                <circle
                  key={AREA_ORDEM_RADAR[indice]}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={cor}
                  stroke="#161616"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>

          <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 sm:mt-2 sm:gap-x-3 sm:gap-y-1.5">
            {AREA_ORDEM_RADAR.map((slug) => {
              const area = porSlug.get(slug);
              const semPratica = !area || area.totalQuestoes === 0;
              const cor = AREA_CORES[slug] ?? "#b0ff57";

              return (
                <div
                  key={slug}
                  className="flex items-center justify-between gap-1.5 text-[10px] sm:gap-2 sm:text-[11px]"
                >
                  <span className="flex items-center gap-1.5 text-white/50">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: cor }}
                    />
                    {AREA_SIGLAS[slug]}
                  </span>
                  <span className="tabular-nums text-white/70">
                    {semPratica ? "—" : `${area.score}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ProgressoCard>
  );
}
