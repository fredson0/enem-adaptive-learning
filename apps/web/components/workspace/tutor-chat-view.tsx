"use client";

import { HeroWave } from "@/components/ui/ai-input-hero";
import { useAuth } from "@/components/auth/auth-provider";
import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { useWorkspaceScrollReporter } from "@/components/workspace/workspace-scroll-context";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { ApiError } from "@/lib/api";
import { compressImageForUpload } from "@/lib/image-compress";
import {
  enviarMensagemTutor,
  presignAnexoTutor,
  uploadAnexoTutor,
  type MensagemHistorico,
} from "@/lib/ia-tutor";
import { consumePendingTutorPrompt } from "@/lib/pending-tutor-prompt";
import { emitirTrilhaAtualizada } from "@/lib/trilha-events";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TutorChatViewProps = {
  initialMessages?: MensagemHistorico[];
};

export function TutorChatView({
  initialMessages = [],
}: TutorChatViewProps) {
  const [messages, setMessages] = useState<MensagemHistorico[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading, requireAuth } = useAuth();
  const { setTokens } = useTokensIa();
  const { registerConversation, sessionKey, activeSession, activeSessionId } =
    useTutorSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingSentRef = useRef(false);
  const handleSubmitRef = useRef<
    (value: string, attachment?: File) => Promise<void>
  >(async () => {});
  const hasMessages = messages.length > 0;
  const reportScroll = useWorkspaceScrollReporter();

  useEffect(() => {
    setMessages(activeSession?.messages ?? initialMessages);
    setError(null);
  }, [sessionKey, activeSession, initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (value: string, attachment?: File) => {
    const mensagem = value.trim();
    if (!mensagem || loading) return;

    if (
      !requireAuth({
        next: "/tutor",
        tutorPrompt: mensagem,
      })
    ) {
      return;
    }

    setError(null);
    setLoading(true);

    const historico = [...messages];
    let anexoUrl: string | undefined;

    try {
      if (attachment) {
        const compressed = await compressImageForUpload(attachment);
        const presign = await presignAnexoTutor(
          compressed.type,
          attachment.name,
        );
        anexoUrl = await uploadAnexoTutor(compressed, presign);
      }

      const withUser: MensagemHistorico = {
        role: "user",
        texto: mensagem,
        anexoUrl,
      };
      setMessages([...historico, withUser]);

      const response = await enviarMensagemTutor({
        mensagem,
        conversaId: activeSessionId ?? undefined,
        anexoUrl,
      });
      setTokens(response.tokens);

      if (response.trilhaAtualizada) {
        emitirTrilhaAtualizada();
      }

      const withAssistant: MensagemHistorico[] = [
        ...historico,
        withUser,
        { role: "assistant", texto: response.resposta },
      ];
      setMessages(withAssistant);
      registerConversation({
        id: response.conversaId,
        title: activeSession?.title ?? mensagem.slice(0, 42),
        messages: withAssistant,
        updatedAt: Date.now(),
      });
    } catch (err) {
      setMessages(historico);
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível enviar a mensagem. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    if (isLoading || !isAuthenticated || pendingSentRef.current) return;

    const pending = consumePendingTutorPrompt();
    if (!pending) return;

    pendingSentRef.current = true;
    void handleSubmitRef.current(pending);
  }, [isAuthenticated, isLoading]);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {hasMessages && (
        <div
          data-lenis-prevent
          data-workspace-scroll
          onScroll={(event) => reportScroll(event.currentTarget.scrollTop)}
          className={cn(
            "absolute inset-x-0 top-20 bottom-44 z-10 overflow-y-auto overscroll-contain md:top-24 md:bottom-48",
            "pl-[calc(var(--osmo-sidebar-width)+1.25rem)] pr-4 md:pl-[calc(var(--osmo-sidebar-width)+1.5rem)] md:pr-6",
            "tutor-prompt-scroll",
          )}
        >
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "max-w-3xl rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-[15px]",
                  message.role === "user"
                    ? "ml-auto bg-[#1f3dbc]/90 text-white"
                    : "mr-auto border border-white/10 bg-[rgba(15,15,20,0.75)] text-white/90 backdrop-blur-md",
                )}
              >
                {message.anexoUrl ? (
                  <div className="mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={message.anexoUrl}
                      alt="Anexo enviado"
                      className="max-h-48 rounded-xl border border-white/15 object-cover"
                    />
                  </div>
                ) : null}
                <p className="whitespace-pre-wrap">{message.texto}</p>
              </div>
            ))}

            {loading && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[rgba(15,15,20,0.75)] px-4 py-3 text-sm text-white/70 backdrop-blur-md">
                <Loader2 className="size-4 animate-spin" />
                O tutor está pensando…
              </div>
            )}

            {error && (
              <div className="mr-auto max-w-3xl rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {!hasMessages && error && (
        <div className="absolute inset-x-0 top-20 z-10 px-4 pl-[calc(var(--osmo-sidebar-width)+1.25rem)] md:pl-[calc(var(--osmo-sidebar-width)+1.5rem)]">
          <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        </div>
      )}

      <HeroWave
        variant="workspace"
        showNavbar={false}
        showHeader
        docked={hasMessages}
        extendLeftPx={0}
        title="Pergunte ao tutor ENEM+"
        subtitle="Explique dúvidas, revise erros de simulado ou peça resumo de qualquer tema do ENEM."
        basePlaceholder="Me explica"
        buttonText="Enviar"
        loading={loading}
        onPromptSubmit={handleSubmit}
        className="h-full"
      />
    </div>
  );
}
