"use client";

import type { TrilhaAssuntoCatalogo } from "@/lib/trilha-catalogo";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type TrilhaAssuntoCardProps = {
  assunto: TrilhaAssuntoCatalogo;
  emFoco?: boolean;
  progresso?: number;
};

/** Card de assunto — dentro de uma modalidade. */
export function TrilhaAssuntoCard({
  assunto,
  emFoco = false,
  progresso = 0,
}: TrilhaAssuntoCardProps) {
  const href = `/trilha/${assunto.areaSlug}?assuntoId=${encodeURIComponent(assunto.id)}&modalidade=${encodeURIComponent(assunto.modalidadeId)}`;
  const inicial = assunto.nome.charAt(0).toUpperCase();

  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "relative aspect-[5/4] overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#161616] transition duration-300 group-hover:border-white/15 group-hover:-translate-y-0.5",
          emFoco && "ring-1 ring-[#b0ff57]/40",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            assunto.gradient,
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.1),transparent_55%)]" />

        <div className="relative flex h-full flex-col justify-between p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span
              className="w-fit rounded-full bg-black/35 px-2 py-0.5 text-[9px] uppercase tracking-wide backdrop-blur-sm"
              style={{ color: assunto.areaCor }}
            >
              {assunto.modalidadeNome.split(" ")[0]}
            </span>
            <span
              className={cn(
                "rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium tabular-nums backdrop-blur-sm",
                progresso >= 100
                  ? "text-emerald-300"
                  : progresso > 0
                    ? "text-white/80"
                    : "text-white/35",
              )}
            >
              {progresso}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <span className="text-2xl font-medium text-white/90" aria-hidden>
              {inicial}
            </span>
            <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition group-hover:opacity-100">
              <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-white/70 transition group-hover:text-white sm:mt-2.5 sm:text-sm">
        {assunto.nome}
      </p>
    </Link>
  );
}

/** @deprecated Use TrilhaAssuntoCard */
export const TrilhaDisciplinaCard = TrilhaAssuntoCard;
