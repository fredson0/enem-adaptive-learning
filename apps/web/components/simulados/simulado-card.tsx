import {
  formatArea,
  formatSimuladoStatus,
  type SimuladoResumo,
} from "@/lib/simulados";
import { formatModoSimulado } from "@/lib/simulado-modos";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
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
};

export function SimuladoCard({ simulado }: SimuladoCardProps) {
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

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#161616] transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
    >
      <div className="relative flex aspect-[16/10] flex-col justify-between bg-gradient-to-br from-[#222] via-[#171717] to-[#111] p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(176,255,87,0.08),transparent_55%)]" />
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
        <div className="relative">
          <p className="text-3xl font-medium tracking-tight text-white">
            {scoreLabel}
          </p>
          <p className="mt-1 text-sm text-white/40">
            {formatArea(simulado.area)} · {progresso}%
          </p>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/70 transition-all group-hover:bg-white"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-white">
              {formatArea(simulado.area)}
            </p>
            <p className="mt-1 text-sm text-white/40">
              {formatDate(
                simulado.finalizadoEm ?? simulado.iniciadoEm,
              )}
            </p>
          </div>
          <ChevronRight
            className="size-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-white/55"
            strokeWidth={1.75}
          />
        </div>
      </div>
    </Link>
  );
}
