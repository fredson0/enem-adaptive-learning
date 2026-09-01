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
        <p className="py-8 text-center text-sm text-osmo-muted">
          Faça treinos em diferentes áreas para ver seu mapa.
        </p>
      ) : (
        <div className="relative mx-auto w-full max-w-[min(100%,200px)] overflow-hidden sm:max-w-[260px]">
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
                  stroke="var(--osmo-border)"
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
                  stroke="var(--osmo-border)"
                  strokeWidth={1}
                  strokeOpacity={0.65}
                />
              );
            })}

            <polygon
              points={pontosData}
              fill="color-mix(in srgb, var(--osmo-accent) 18%, transparent)"
              stroke="var(--osmo-accent)"
              strokeWidth={2}
            />

            {valores.map((valor, indice) => {
              if (valor <= 0) return null;
              const p = pontoNoEixo(indice, valor, raioMax, cx, cy, total);
              const cor = AREA_CORES[AREA_ORDEM_RADAR[indice]] ?? "var(--osmo-accent)";
              return (
                <circle
                  key={AREA_ORDEM_RADAR[indice]}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={cor}
                  stroke="var(--osmo-card)"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>

          <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 sm:mt-2 sm:gap-x-3 sm:gap-y-1.5">
            {AREA_ORDEM_RADAR.map((slug) => {
              const area = porSlug.get(slug);
              const semPratica = !area || area.totalQuestoes === 0;
              const cor = AREA_CORES[slug] ?? "var(--osmo-accent)";

              return (
                <div
                  key={slug}
                  className="flex items-center justify-between gap-1.5 text-[10px] sm:gap-2 sm:text-[11px]"
                >
                  <span className="flex items-center gap-1.5 text-osmo-muted">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: cor }}
                    />
                    {AREA_SIGLAS[slug]}
                  </span>
                  <span className="tabular-nums text-osmo">
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
