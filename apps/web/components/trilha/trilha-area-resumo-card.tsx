"use client";

import type { TrilhaArea } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PRIORIDADE_STYLES = {
  Alta: "bg-red-500/15 text-red-300 border-red-500/20",
  Média: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Baixa: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
} as const;

const AREA_GRADIENTS: Record<string, string> = {
  matematica: "from-[#1a2a4a] via-[#161616] to-[#111]",
  linguagens: "from-[#3a1a2a] via-[#161616] to-[#111]",
  humanas: "from-[#3a2a10] via-[#161616] to-[#111]",
  natureza: "from-[#103a2a] via-[#161616] to-[#111]",
};

type TrilhaAreaResumoCardProps = {
  area: TrilhaArea;
};

/** Card resumo — só navegação, sem etapas (usado em /trilha/geral). */
export function TrilhaAreaResumoCard({ area }: TrilhaAreaResumoCardProps) {
  return (
    <Link
      href={`/trilha/${area.slug}`}
      className="group block overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#161616] transition hover:border-white/15 hover:bg-[#1a1a1a]"
    >
      <div
        className={cn(
          "relative flex aspect-[16/10] flex-col justify-between bg-gradient-to-br p-5",
          AREA_GRADIENTS[area.slug] ?? "from-[#222] via-[#171717] to-[#111]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide",
              PRIORIDADE_STYLES[area.prioridade],
            )}
          >
            {area.prioridade}
          </span>
          <div className="text-right">
            <p className="text-2xl font-medium tracking-tight text-white">
              {area.progresso}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              da trilha
            </p>
          </div>
        </div>

        <div>
          <p className="text-lg font-medium text-white">{area.label}</p>
          <p className="mt-1 text-sm text-white/45">
            {area.proficienciaReal > 0
              ? `${area.proficienciaReal}% nos simulados`
              : "Baseado no seu diagnóstico"}
          </p>
          {area.disciplinasSugeridas.length > 0 ? (
            <p className="mt-2 text-xs text-[#b0ff57]/80">
              Foco: {area.disciplinasSugeridas.join(" · ")}
            </p>
          ) : null}
        </div>

        <p className="mt-4 text-xs text-white/40 transition group-hover:text-white/70">
          Ver etapas →
        </p>
      </div>
    </Link>
  );
}
