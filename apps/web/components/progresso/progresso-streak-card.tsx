"use client";

import { ProgressoCard } from "@/components/progresso/progresso-card";
import type { RitmoSemanal } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { Check, Flame } from "lucide-react";

type ProgressoStreakCardProps = {
  ritmo: RitmoSemanal;
};

export function ProgressoStreakCard({ ritmo }: ProgressoStreakCardProps) {
  const labelDias =
    ritmo.diasAtivosNaSemana === 1
      ? "1 dia"
      : `${ritmo.diasAtivosNaSemana} dias`;

  return (
    <ProgressoCard icon={<Flame className="size-4" />} title="Ritmo da semana">
      <p className="text-3xl font-medium tracking-tight text-white">
        {labelDias}
      </p>
      <p className="mt-1 text-xs text-white/40">com prática esta semana</p>

      <div className="mt-5 flex justify-between gap-1">
        {ritmo.dias.map((dia) => (
          <div key={dia.label} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full border transition",
                dia.ativo
                  ? "border-[#b0ff57]/40 bg-[#b0ff57] text-black"
                  : "border-white/10 bg-white/[0.03] text-white/20",
                dia.hoje && !dia.ativo && "ring-1 ring-white/25",
              )}
            >
              {dia.ativo ? (
                <Check className="size-3.5" strokeWidth={2.5} />
              ) : (
                <span className="size-1.5 rounded-full bg-white/15" />
              )}
            </div>
            <span
              className={cn(
                "text-[9px] uppercase tracking-wide",
                dia.hoje ? "text-white/70" : "text-white/30",
              )}
            >
              {dia.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-white/[0.06] pt-4 text-xs text-white/45">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="size-3.5 text-[#b0ff57]" />
          {ritmo.sequenciaAtual > 0
            ? `${ritmo.sequenciaAtual} dia${ritmo.sequenciaAtual === 1 ? "" : "s"} seguidos`
            : "Sem sequência ativa"}
        </span>
        {ritmo.melhorSequencia > 0 ? (
          <span className="text-white/30">
            Melhor: {ritmo.melhorSequencia} dia
            {ritmo.melhorSequencia === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
    </ProgressoCard>
  );
}
