"use client";

import { TrilhaIcone } from "@/components/trilha/trilha-icone";
import { obterVisualArea } from "@/lib/area-visual";
import {
  formatArea,
  formatSimuladoStatus,
  type SimuladoResumo,
} from "@/lib/simulados";
import { formatModoSimulado } from "@/lib/simulado-modos";
import { cn } from "@/lib/utils";
import { ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

type SimuladoCardProps = {
  simulado: SimuladoResumo;
  onExcluir?: (id: string) => void;
  excluindoId?: string | null;
};

export function SimuladoCard({
  simulado,
  onExcluir,
  excluindoId,
}: SimuladoCardProps) {
  const href =
    simulado.status === "CONCLUIDO"
      ? `/simulados/${simulado.id}/resultado`
      : `/simulados/${simulado.id}`;

  const progresso =
    simulado.status === "CONCLUIDO"
      ? Math.round((simulado.acertos / simulado.totalQuestoes) * 100)
      : Math.round((simulado.respondidas / simulado.totalQuestoes) * 100);

  const scoreLabel =
    simulado.status === "CONCLUIDO"
      ? `${simulado.acertos}/${simulado.totalQuestoes}`
      : `${simulado.respondidas}/${simulado.totalQuestoes}`;

  const podeExcluir = simulado.status === "EM_ANDAMENTO" && onExcluir;
  const visual = obterVisualArea(simulado.area);

  return (
    <div className="group overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#161616] transition-colors hover:border-white/10 hover:bg-[#1a1a1a]">
      <Link href={href} className="block">
        <div
          className="relative flex aspect-[16/10] flex-col justify-between p-5"
          style={{ backgroundImage: visual.gradiente }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundImage: visual.glow }}
          />
          <div className="relative flex items-start justify-between gap-2">
            <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/55">
              {formatModoSimulado(simulado.modo)}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                simulado.status === "CONCLUIDO"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-200",
              )}
            >
              {formatSimuladoStatus(simulado.status)}
            </span>
          </div>

          <div className="relative flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-3xl font-medium tracking-tight text-white">
                {scoreLabel}
              </p>
              <p className="mt-1 truncate text-sm text-white/40">
                {formatArea(simulado.area)} · {progresso}%
              </p>
            </div>
            <TrilhaIcone
              id={visual.slug ?? "geral"}
              cor={visual.cor}
              icone={visual.icone}
              size="lg"
              pulsando={simulado.status === "EM_ANDAMENTO"}
            />
          </div>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progresso}%`, backgroundColor: visual.cor }}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {formatArea(simulado.area)}
              </p>
              <p className="mt-1 text-sm text-white/40">
                {formatDate(simulado.finalizadoEm ?? simulado.iniciadoEm)}
              </p>
            </div>
            <ChevronRight
              className="size-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-white/55"
              strokeWidth={1.75}
            />
          </div>
        </div>
      </Link>

      {podeExcluir ? (
        <div className="border-t border-white/[0.06] px-5 py-3">
          <button
            type="button"
            disabled={excluindoId === simulado.id}
            onClick={() => onExcluir(simulado.id)}
            className="inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} />
            {excluindoId === simulado.id ? "Excluindo…" : "Cancelar simulado"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
