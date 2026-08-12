"use client";

import type { TrilhaArea } from "@/lib/trilha";
import { formatarAssuntos } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const AREA_PREVIEW: Record<
  string,
  { gradient: string; accent: string; tag: string }
> = {
  matematica: {
    gradient: "from-[#1e3a8a] via-[#1a1a2e] to-[#111]",
    accent: "#60a5fa",
    tag: "Exatas",
  },
  linguagens: {
    gradient: "from-[#831843] via-[#1a1020] to-[#111]",
    accent: "#f472b6",
    tag: "Texto",
  },
  humanas: {
    gradient: "from-[#78350f] via-[#1a1510] to-[#111]",
    accent: "#fbbf24",
    tag: "Humanas",
  },
  natureza: {
    gradient: "from-[#064e3b] via-[#0f1a18] to-[#111]",
    accent: "#34d399",
    tag: "Natureza",
  },
};

type TrilhaModalityCardProps = {
  area: TrilhaArea;
  isPrioridade?: boolean;
};

/** Card estilo Osmo Tutorials — preview + título abaixo. */
export function TrilhaModalityCard({
  area,
  isPrioridade = false,
}: TrilhaModalityCardProps) {
  const preview = AREA_PREVIEW[area.slug] ?? {
    gradient: "from-[#222] to-[#111]",
    accent: "#b0ff57",
    tag: "ENEM",
  };

  return (
    <Link href={`/trilha/${area.slug}`} className="group block">
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#161616] transition duration-300 group-hover:border-white/15",
          isPrioridade && "ring-1 ring-[#5b4dff]/40",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            preview.gradient,
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white/80 backdrop-blur-sm">
              {preview.tag}
            </span>
            {isPrioridade ? (
              <span className="rounded-full bg-[#5b4dff] px-2.5 py-1 text-[10px] font-medium text-white">
                Prioridade
              </span>
            ) : (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/70">
                {area.prioridade}
              </span>
            )}
          </div>

          <div>
            <p className="text-4xl font-medium tracking-tight text-white">
              {area.progresso}%
            </p>
            <p className="mt-1 text-sm text-white/60">{area.label}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="max-w-[85%] truncate text-xs text-white/45">
              {area.proximaEtapa?.titulo ??
                (area.disciplinasSugeridas[0]
                  ? formatarAssuntos(area.disciplinasSugeridas.slice(0, 2))
                  : "Ver plano completo")}
            </p>
            <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition group-hover:opacity-100">
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-white/55 transition group-hover:text-white">
        {area.label}
      </p>
      <p className="mt-0.5 text-xs text-white/35">
        {area.proximaEtapa
          ? `Próximo: ${area.proximaEtapa.titulo}`
          : "Trilha concluída"}{" "}
        ·{" "}
        {area.proficienciaReal > 0
          ? `${area.proficienciaReal}% nos simulados`
          : "baseado no diagnóstico"}
      </p>
    </Link>
  );
}
