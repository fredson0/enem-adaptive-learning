"use client";

import type { TrilhaPersonalizarChat } from "@/components/trilha/use-trilha-personalizar-chat";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Loader2, X } from "lucide-react";

const LAYOUT_ID = "trilha-personalizar-cta";

type TrilhaPersonalizarBotaoProps = {
  chat: TrilhaPersonalizarChat;
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
};

export function TrilhaPersonalizarBotao({
  chat,
  label = "Personalizar trilha com IA",
  variant = "primary",
  className,
}: TrilhaPersonalizarBotaoProps) {
  if (chat.aberto) return null;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.button
        type="button"
        layoutId={LAYOUT_ID}
        disabled={chat.iniciando}
        onClick={() => void chat.abrir()}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition disabled:opacity-60",
          variant === "primary"
            ? "bg-[#b0ff57] text-black hover:bg-[#c4ff7a]"
            : "border border-[#b0ff57]/30 bg-[#b0ff57]/10 text-[#b0ff57] hover:bg-[#b0ff57]/15",
        )}
      >
        {chat.iniciando ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          label
        )}
      </motion.button>
      {chat.error ? (
        <p className="text-xs text-red-400">{chat.error}</p>
      ) : null}
    </div>
  );
}

type TrilhaPersonalizarPainelProps = {
  chat: TrilhaPersonalizarChat;
  titulo?: string;
  subtitulo?: string;
};

export function TrilhaPersonalizarPainel({
  chat,
  titulo = "Monte sua checklist",
  subtitulo,
}: TrilhaPersonalizarPainelProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!chat.aberto) return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void chat.enviar();
    }
  };

  return (
    <motion.section
      ref={chat.painelRef}
      layoutId={LAYOUT_ID}
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex max-h-[min(82vh,760px)] min-h-[min(82vh,760px)] flex-col px-2 pb-6 pt-4 md:px-0"
    >
      <button
        type="button"
        onClick={chat.fechar}
        className="absolute right-0 top-0 z-10 rounded-full p-2 text-white/25 transition hover:text-white/60"
        aria-label="Fechar"
      >
        <X className="size-5" />
      </button>

      <div className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col">
        <div className="shrink-0 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-white md:text-[2.75rem] md:leading-tight">
            {titulo}
          </h2>
          {subtitulo ? (
            <p className="mt-3 text-sm text-white/35 md:text-base">
              {subtitulo}
            </p>
          ) : null}
        </div>

        <div
          ref={chat.mensagensRef}
          data-lenis-prevent
          className="tutor-prompt-scroll mt-8 min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto w-full max-w-xl space-y-5 py-2">
            {chat.mensagens.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={cn(
                  "max-w-[92%] rounded-2xl px-4 py-3 text-left text-base leading-relaxed md:text-[15px]",
                  msg.role === "user"
                    ? "ml-auto bg-[#1f3dbc]/90 text-white"
                    : "mr-auto border border-white/10 bg-[rgba(15,15,20,0.55)] text-white/85",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.texto}</p>
              </div>
            ))}
            {chat.loading ? (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[rgba(15,15,20,0.55)] px-4 py-3 text-sm text-white/50">
                <Loader2 className="size-4 animate-spin" />
                Montando sua checklist…
              </div>
            ) : null}
            <div ref={chat.fimRef} className="h-px shrink-0" />
          </div>
        </div>

        <div className="mt-4 w-full max-w-xl shrink-0 space-y-4 self-center">
          <div className="flex items-end gap-3 rounded-2xl border border-white/[0.08] bg-[#141414] px-4 py-3">
            <textarea
              ref={chat.inputRef}
              value={chat.input}
              onChange={(e) => chat.setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Sua resposta…"
              disabled={chat.loading || chat.finalizando}
              style={{ scrollBehavior: "smooth" }}
              className="tutor-prompt-scroll min-h-[24px] w-full flex-1 resize-none overflow-y-auto bg-transparent text-sm leading-relaxed text-white placeholder:text-white/25 focus:outline-none md:text-base"
            />
            <button
              type="button"
              onClick={() => void chat.enviar()}
              disabled={
                !chat.input.trim() || chat.loading || chat.finalizando
              }
              className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:opacity-30"
              aria-label="Enviar"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => void chat.finalizar()}
            disabled={
              !chat.podeFinalizar || chat.finalizando || chat.loading
            }
            className={cn(
              "mx-auto flex h-14 w-full max-w-sm items-center justify-center rounded-lg text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(91,77,255,0.35)] transition",
              "bg-[#5b4dff] hover:bg-[#6559ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
            )}
          >
            {chat.finalizando ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Finalizar"
            )}
          </button>

          {chat.error ? (
            <p className="text-center text-xs text-red-400">{chat.error}</p>
          ) : null}
          <p className="text-center text-[11px] text-white/25">
            Enter envia · Shift+Enter nova linha
          </p>
        </div>
      </div>
    </motion.section>
  );
}
