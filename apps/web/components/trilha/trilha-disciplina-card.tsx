"use client";

import { TrilhaIcone } from "@/components/trilha/trilha-icone";
import type {
  TrilhaAssuntoCatalogo,
  TrilhaDisciplinaCatalogo,
} from "@/lib/trilha-catalogo";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type TrilhaAssuntoCardProps = {
  assunto: TrilhaAssuntoCatalogo;
  emFoco?: boolean;
  progresso?: number;
  dominadas?: number;
  disponiveis?: number;
};

function montarHrefAssunto(assunto: TrilhaAssuntoCatalogo): string {
  const params = new URLSearchParams({
    assuntoId: assunto.id,
    modalidade: assunto.modalidadeId,
  });
  if (assunto.disciplinaId) {
    params.set("disciplina", assunto.disciplinaId);
  }
  return `/trilha/${assunto.areaSlug}?${params.toString()}`;
}

/** Card de assunto — dentro de uma modalidade ou disciplina. */
export function TrilhaAssuntoCard({
  assunto,
  emFoco = false,
  progresso = 0,
  dominadas,
  disponiveis,
}: TrilhaAssuntoCardProps) {
  const href = montarHrefAssunto(assunto);
  const tag =
    assunto.disciplinaNome?.split(" ")[0] ??
    assunto.modalidadeNome.split(" ")[0];

  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "osmo-surface-dark relative aspect-[5/4] overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#161616] transition duration-300 group-hover:border-white/15 group-hover:-translate-y-0.5",
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
              {tag}
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

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <TrilhaIcone
              id={assunto.id}
              cor={assunto.areaCor}
              areaSlug={assunto.areaSlug}
              size="md"
              pulsando={emFoco}
            />
          </div>

          <div className="flex items-end justify-end">
            <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition group-hover:opacity-100">
              <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-osmo-muted transition group-hover:text-osmo sm:mt-2.5 sm:text-sm">
        {assunto.nome}
      </p>
      {disponiveis !== undefined && disponiveis > 0 ? (
        <p className="mt-0.5 text-[10px] tabular-nums text-osmo-subtle sm:text-[11px]">
          {dominadas ?? 0}/{disponiveis} dominadas
        </p>
      ) : null}
    </Link>
  );
}

type TrilhaDisciplinaCardProps = {
  disciplina: TrilhaDisciplinaCatalogo;
  emFoco?: boolean;
  progresso?: number;
};

/** Card de matéria — abre os assuntos da disciplina. */
export function TrilhaDisciplinaCard({
  disciplina,
  emFoco = false,
  progresso = 0,
}: TrilhaDisciplinaCardProps) {
  const href = `/trilha/geral?modalidade=${encodeURIComponent(disciplina.modalidadeId)}&disciplina=${encodeURIComponent(disciplina.id)}`;

  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "osmo-surface-dark relative aspect-[5/4] overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#161616] transition duration-300 group-hover:border-white/15 group-hover:-translate-y-0.5",
          emFoco && "ring-1 ring-[#b0ff57]/40",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            disciplina.gradient,
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.1),transparent_55%)]" />

        <div className="relative flex h-full flex-col justify-between p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span
              className="w-fit rounded-full bg-black/35 px-2 py-0.5 text-[9px] uppercase tracking-wide backdrop-blur-sm"
              style={{ color: disciplina.areaCor }}
            >
              {disciplina.areaTag}
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

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <TrilhaIcone
              id={disciplina.id}
              cor={disciplina.areaCor}
              areaSlug={disciplina.areaSlug}
              size="lg"
              pulsando={emFoco}
            />
          </div>

          <div className="flex items-end justify-end">
            <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition group-hover:opacity-100">
              <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-osmo-muted transition group-hover:text-osmo sm:mt-2.5 sm:text-sm">
        {disciplina.nome}
      </p>
      <p className="mt-0.5 text-[10px] text-osmo-subtle sm:text-[11px]">
        {disciplina.assuntos.length} assunto
        {disciplina.assuntos.length === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
