"use client";

import type { SimuladoNavegacaoItem } from "@/lib/simulados";
import { cn } from "@/lib/utils";

type SimuladoNavegacaoStripProps = {
  navegacao: SimuladoNavegacaoItem[];
  ordemAtual: number;
  indiceProgresso: number;
  onSelecionar: (ordem: number) => void;
};

export function SimuladoNavegacaoStrip({
  navegacao,
  ordemAtual,
  indiceProgresso,
  onSelecionar,
}: SimuladoNavegacaoStripProps) {
  return (
    <div
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-none"
      role="navigation"
      aria-label="Questões do simulado"
    >
      {navegacao.map((item) => {
        const numero = item.ordem + 1;
        const podeAcessar = item.ordem <= indiceProgresso;
        const ativa = item.ordem === ordemAtual;

        return (
          <button
            key={item.questaoId}
            type="button"
            disabled={!podeAcessar}
            onClick={() => onSelecionar(item.ordem)}
            title={
              item.respondida
                ? `Questão ${numero} — ${item.correto ? "acerto" : "erro"}`
                : `Questão ${numero}`
            }
            className={cn(
              "flex size-8 shrink-0 snap-start items-center justify-center rounded-lg border text-xs font-medium transition",
              !podeAcessar && "cursor-not-allowed border-white/5 text-white/20",
              podeAcessar &&
                !ativa &&
                item.respondida &&
                item.correto &&
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-500/50",
              podeAcessar &&
                !ativa &&
                item.respondida &&
                !item.correto &&
                "border-red-500/30 bg-red-500/10 text-red-200 hover:border-red-500/50",
              podeAcessar &&
                !ativa &&
                !item.respondida &&
                "border-white/10 text-white/50 hover:border-white/25 hover:text-white",
              ativa &&
                "border-white bg-white text-black",
            )}
          >
            {numero}
          </button>
        );
      })}
    </div>
  );
}
