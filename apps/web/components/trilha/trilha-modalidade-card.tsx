"use client";

import type { TrilhaModalidadeItem } from "@/lib/trilha-catalogo";
import { contarAssuntosModalidade, modalidadeTemDisciplinas } from "@/lib/trilha-catalogo";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type TrilhaModalidadeCardProps = {
  modalidade: TrilhaModalidadeItem;
  emFoco?: boolean;
  isPrioridadeArea?: boolean;
  href?: string;
};

/** Card de modalidade — clique abre os assuntos. */
export function TrilhaModalidadeCard({
  modalidade,
  emFoco = false,
  isPrioridadeArea = false,
  href,
}: TrilhaModalidadeCardProps) {
  const destino =
    href ?? `/trilha/geral?modalidade=${encodeURIComponent(modalidade.id)}`;
  const inicial = modalidade.nome.charAt(0).toUpperCase();

  return (
    <Link href={destino} className="group block">
      <div
        className={cn(
          "relative aspect-[5/4] overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#161616] transition duration-300 group-hover:border-white/15 group-hover:-translate-y-0.5",
          emFoco && "ring-1 ring-[#b0ff57]/40",
          isPrioridadeArea && !emFoco && "ring-1 ring-[#5b4dff]/25",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            modalidade.gradient,
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.1),transparent_55%)]" />

        <div className="relative flex h-full flex-col justify-between p-3.5">
          <div className="flex items-start justify-between gap-1">
            <span
              className="rounded-full bg-black/35 px-2 py-0.5 text-[9px] uppercase tracking-wide backdrop-blur-sm"
              style={{ color: modalidade.areaCor }}
            >
              {modalidade.areaTag}
            </span>
            {emFoco ? (
              <span className="rounded-full bg-[#b0ff57]/20 px-2 py-0.5 text-[9px] font-medium text-[#b0ff57]">
                Foco
              </span>
            ) : isPrioridadeArea ? (
              <span className="rounded-full bg-[#5b4dff]/25 px-2 py-0.5 text-[9px] font-medium text-[#c4bbff]">
                Prioridade
              </span>
            ) : null}
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
        {modalidade.nome}
      </p>
      <p className="mt-0.5 text-[10px] text-white/35 sm:text-[11px]">
        {modalidadeTemDisciplinas(modalidade)
          ? `${modalidade.disciplinas?.length ?? 0} matérias`
          : `${contarAssuntosModalidade(modalidade)} assuntos`}
      </p>
    </Link>
  );
}
