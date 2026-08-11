"use client";

import { cn } from "@/lib/utils";
import { Lightbulb, Loader2, X } from "lucide-react";

type SimuladoDicaPanelProps = {
  aberto: boolean;
  dica: string | null;
  carregando: boolean;
  erro: string | null;
  onFechar?: () => void;
};

export function SimuladoDicaPanel({
  aberto,
  dica,
  carregando,
  erro,
  onFechar,
}: SimuladoDicaPanelProps) {
  return (
    <aside
      aria-hidden={!aberto}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none lg:sticky lg:top-24 lg:max-h-[calc(100vh-12rem)]",
        aberto
          ? "max-h-[min(70vh,720px)] translate-x-0 opacity-100 lg:max-h-[calc(100vh-12rem)]"
          : "pointer-events-none max-h-0 translate-x-8 opacity-0 lg:max-h-0",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col rounded-[14px] border border-amber-500/20 bg-[#14120f] transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
          aberto ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-amber-500/10 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-200">
            <Lightbulb className="size-4" strokeWidth={1.75} />
            Dica do tutor
          </p>
          {onFechar ? (
            <button
              type="button"
              onClick={onFechar}
              className="inline-flex size-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-white/70"
              aria-label="Fechar dica"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 tutor-prompt-scroll"
        >
          {carregando ? (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="size-4 animate-spin" />
              Buscando dica…
            </div>
          ) : null}

          {erro ? <p className="text-sm text-red-400">{erro}</p> : null}

          {dica ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">
              {dica}
            </p>
          ) : null}

          {!carregando && !erro && !dica ? (
            <p className="text-sm text-white/40">
              A dica aparecerá aqui quando estiver pronta.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
