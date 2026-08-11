"use client";

import type { SimuladoResultado } from "@/lib/simulados";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type QuestaoErro = SimuladoResultado["questoes"][number];

type QuestaoRevisaoModalProps = {
  questao: QuestaoErro | null;
  onClose: () => void;
};

function renderMarkdownLite(text: string) {
  return text
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

export function QuestaoRevisaoModal({
  questao,
  onClose,
}: QuestaoRevisaoModalProps) {
  useEffect(() => {
    if (!questao) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [questao, onClose]);

  if (!questao || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Questão ENEM ${questao.ano} ${questao.indice}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-3xl flex-col">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-sm font-medium text-white/70">
            ENEM {questao.ano} · Questão {questao.indice}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <article
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 md:p-8 tutor-prompt-scroll"
        >
          {questao.imagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={questao.imagemUrl}
              alt=""
              className="mb-6 max-h-64 rounded-lg object-contain"
            />
          ) : null}

          <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
            {renderMarkdownLite(questao.contexto)}
          </div>

          {questao.introducaoAlternativas ? (
            <p className="mt-6 text-sm text-white/60">
              {questao.introducaoAlternativas}
            </p>
          ) : null}

          <div className="mt-6 space-y-2">
            {questao.alternativas.map((alt) => {
              const marcada = questao.alternativaMarcada === alt.letra;
              const correta = questao.gabarito === alt.letra;

              return (
                <div
                  key={alt.letra}
                  className={`flex items-start gap-3 rounded-[10px] border px-4 py-3 text-sm ${
                    marcada
                      ? "border-red-500/30 bg-red-500/10 text-white"
                      : correta
                        ? "border-emerald-500/30 bg-emerald-500/10 text-white"
                        : "border-white/10 bg-[#111] text-white/80"
                  }`}
                >
                  <span className="mt-0.5 font-medium">{alt.letra})</span>
                  <span>{alt.texto}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-white/[0.06] pt-4 text-sm">
            <span className="text-red-400">
              Sua resposta: {questao.alternativaMarcada ?? "—"}
            </span>
            <span className="text-emerald-400">Gabarito: {questao.gabarito}</span>
          </div>
        </article>

        <p className="mt-3 text-center text-xs text-white/35">
          Esc fecha · clique fora para voltar à lista
        </p>
      </div>
    </div>,
    document.body,
  );
}
