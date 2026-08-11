"use client";

import type { TrilhaArea } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Circle } from "lucide-react";
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

type TrilhaAreaCardProps = {
  area: TrilhaArea;
  destaque?: boolean;
  onAbrirTutor: (pergunta: string) => void;
};

export function TrilhaAreaCard({
  area,
  destaque = false,
  onAbrirTutor,
}: TrilhaAreaCardProps) {
  const proximaEtapa = area.etapas.find((etapa) => !etapa.concluida);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[14px] border transition-colors",
        destaque
          ? "border-[#b0ff57]/25 bg-[#161616] ring-1 ring-[#b0ff57]/10"
          : "border-white/[0.06] bg-[#161616] hover:border-white/10",
      )}
    >
      <div
        className={cn(
          "relative flex aspect-[16/9] flex-col justify-between bg-gradient-to-br p-5 sm:aspect-[16/10]",
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
              : "Ainda sem simulados — baseado no seu diagnóstico"}
          </p>
          {area.disciplinasSugeridas.length > 0 ? (
            <p className="mt-2 text-xs text-[#b0ff57]/80">
              Foco: {area.disciplinasSugeridas.join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(176,255,87,0.06),transparent_50%)]" />
      </div>

      <div className="space-y-4 p-5">
        <ol className="space-y-2">
          {area.etapas.map((etapa) => (
            <li
              key={etapa.id}
              className={cn(
                "flex items-start gap-3 rounded-[10px] border px-3 py-2.5 text-sm",
                etapa.concluida
                  ? "border-emerald-500/15 bg-emerald-500/5 text-white/55"
                  : etapa.id === proximaEtapa?.id
                    ? "border-white/15 bg-white/[0.04] text-white"
                    : "border-white/[0.06] text-white/55",
              )}
            >
              <span className="mt-0.5 shrink-0">
                {etapa.concluida ? (
                  <Check className="size-4 text-emerald-400" strokeWidth={2} />
                ) : (
                  <Circle className="size-4 text-white/25" strokeWidth={1.75} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{etapa.titulo}</p>
                <p className="mt-0.5 text-xs text-white/40">{etapa.descricao}</p>
              </div>
              {etapa.href && !etapa.concluida ? (
                <Link
                  href={etapa.href}
                  className="shrink-0 text-white/40 transition hover:text-white"
                  aria-label={etapa.titulo}
                >
                  <ChevronRight className="size-4" strokeWidth={1.75} />
                </Link>
              ) : null}
              {etapa.tipo === "tutor" && !etapa.concluida ? (
                <button
                  type="button"
                  onClick={() => onAbrirTutor(area.perguntaTutor)}
                  className="shrink-0 text-xs text-[#b0ff57]/80 underline-offset-2 hover:underline"
                >
                  Abrir
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}
