"use client";

import { HeroWave } from "@/components/ui/ai-input-hero";
import { TutorQuestaoContextBanner } from "@/components/workspace/tutor-questao-context-banner";
import { useAuth } from "@/components/auth/auth-provider";
import { TutorSugestoesChips } from "@/components/workspace/tutor-sugestoes-chips";
import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { useWorkspaceToast } from "@/components/workspace/workspace-toast";
import { useWorkspaceScrollReporter } from "@/components/workspace/workspace-scroll-context";
import { workspaceContentOffsetClass } from "@/components/workspace/workspace-sidebar-context";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { ApiError } from "@/lib/api";
import { isLimiteTokensError } from "@/lib/api-errors";
import { compressImageForUpload } from "@/lib/image-compress";
import {
  gerarPdfQuestoesTutor,
  gerarPdfResumoTutor,
  presignAnexoTutor,
  uploadAnexoTutor,
  type MensagemHistorico,
} from "@/lib/ia-tutor";
import { enviarMensagemTutorStream } from "@/lib/ia-tutor-stream";
import { consumePendingTutorPrompt } from "@/lib/pending-tutor-prompt";
import {
  baixarQuestoesComoHtml,
  baixarQuestoesComoPdf,
  usuarioPediuPdfQuestoes,
} from "@/lib/pdf-questoes";
import { abrirJanelaImpressao } from "@/lib/pdf-print";
import {
  baixarResumoComoHtml,
  baixarResumoComoPdf,
  CUSTO_TOKENS_PDF_RESUMO,
  usuarioPediuPdf,
} from "@/lib/pdf-resumo";
import { emitirTrilhaAtualizada } from "@/lib/trilha-events";
import {
  montarChipsSugestoesTutor,
  montarSugestoesAnimadasTutor,
} from "@/lib/tutor-sugestoes";
import { fetchLacunas, type LacunasResponse } from "@/lib/metricas";
import { cn } from "@/lib/utils";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type TutorChatViewProps = {
  initialMessages?: MensagemHistorico[];
};

export function TutorChatView({
  initialMessages = [],
}: TutorChatViewProps) {
  const [messages, setMessages] = useState<MensagemHistorico[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<{
    index: number;
    tipo: "resumo" | "questoes";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contextDismissed, setContextDismissed] = useState(false);
  const [lacunas, setLacunas] = useState<LacunasResponse | null>(null);
  const { isAuthenticated, isLoading, requireAuth } = useAuth();
  const { setTokens } = useTokensIa();
  const { showToast } = useWorkspaceToast();
  const { registerConversation, sessionKey, activeSession, activeSessionId } =
    useTutorSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingSentRef = useRef(false);
  const handleSubmitRef = useRef<
    (value: string, attachment?: File) => Promise<void>
  >(async () => {});
  const hasMessages = messages.length > 0;
  const reportScroll = useWorkspaceScrollReporter();
  const sugestoesAnimadas = useMemo(
    () => montarSugestoesAnimadasTutor(lacunas),
    [lacunas],
  );
  const chipsSugestoes = useMemo(
    () => montarChipsSugestoesTutor(lacunas),
    [lacunas],
  );

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    fetchLacunas()
      .then(setLacunas)
      .catch(() => setLacunas(null));
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    setMessages(activeSession?.messages ?? initialMessages);
    setError(null);
    setContextDismissed(false);
  }, [sessionKey, activeSession, initialMessages]);

  const questaoContext = activeSession?.questaoContext ?? null;
  const showQuestaoContext = questaoContext && !contextDismissed;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingText]);

  const tratarErroIa = (err: unknown, fallback: string) => {
    if (isLimiteTokensError(err)) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Limite diário de tokens IA atingido.";
      showToast({
        message,
        actionLabel: "Ver planos",
        actionHref: "/planos",
      });
      setError(message);
      return;
    }

    if (err instanceof ApiError) {
      setError(err.message);
      return;
    }

    if (err instanceof Error) {
      setError(err.message);
      return;
    }

    setError(fallback);
  };

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

      const response = await enviarMensagemTutorStream(
        {
          mensagem,
          conversaId: activeSessionId ?? undefined,
          anexoUrl,
        },
        {
          onDelta: (chunk) => {
            setStreamingText((prev) => (prev ?? "") + chunk);
          },
        },
      );
      setTokens(response.tokens);
      setStreamingText(null);

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
      setStreamingText(null);
      tratarErroIa(err, "Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  handleSubmitRef.current = handleSubmit;

  const handleGerarPdfResumo = async (assistantIndex: number) => {
    const mensagemAssistente = messages[assistantIndex];
    if (!mensagemAssistente || mensagemAssistente.role !== "assistant") return;

    if (
      !requireAuth({
        next: "/tutor",
      })
    ) {
      return;
    }

    const mensagemUsuarioAnterior = [...messages]
      .slice(0, assistantIndex)
      .reverse()
      .find((item) => item.role === "user");

    setError(null);
    setPdfLoading({ index: assistantIndex, tipo: "resumo" });
    const janelaImpressao = abrirJanelaImpressao("Material ENEM+");

    try {
      const response = await gerarPdfResumoTutor({
        conteudoBase: mensagemAssistente.texto,
        assuntoNome: mensagemUsuarioAnterior?.texto,
        conversaId: activeSessionId ?? undefined,
      });

      setTokens(response.tokens);

      try {
        baixarResumoComoPdf(response.resumo, janelaImpressao);
      } catch {
        janelaImpressao?.close();
        baixarResumoComoHtml(response.resumo);
      }
    } catch (err) {
      janelaImpressao?.close();
      tratarErroIa(err, "Não foi possível gerar o PDF explicativo. Tente novamente.");
    } finally {
      setPdfLoading(null);
    }
  };

  const handleGerarPdfQuestoes = async (assistantIndex: number) => {
    const mensagemAssistente = messages[assistantIndex];
    if (!mensagemAssistente || mensagemAssistente.role !== "assistant") return;

    if (
      !requireAuth({
        next: "/tutor",
      })
    ) {
      return;
    }

    const mensagemUsuarioAnterior = [...messages]
      .slice(0, assistantIndex)
      .reverse()
      .find((item) => item.role === "user");

    setError(null);
    setPdfLoading({ index: assistantIndex, tipo: "questoes" });
    const janelaImpressao = abrirJanelaImpressao("Questões ENEM+");

    try {
      const response = await gerarPdfQuestoesTutor({
        assuntoNome: mensagemUsuarioAnterior?.texto,
        conteudoBase: mensagemAssistente.texto,
        quantidade: 5,
        incluirGabarito: true,
      });

      const payload = {
        titulo: response.titulo,
        assuntoNome: response.assuntoNome,
        areaSlug: response.areaSlug,
        incluirGabarito: response.incluirGabarito,
        questoes: response.questoes,
      };

      try {
        baixarQuestoesComoPdf(payload, janelaImpressao);
      } catch {
        janelaImpressao?.close();
        baixarQuestoesComoHtml(payload);
      }
    } catch (err) {
      janelaImpressao?.close();
      tratarErroIa(err, "Não foi possível gerar o PDF de questões. Tente novamente.");
    } finally {
      setPdfLoading(null);
    }
  };

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
            workspaceContentOffsetClass,
            "tutor-prompt-scroll",
          )}
        >
          <div className="space-y-4 pb-4">
            {showQuestaoContext ? (
              <TutorQuestaoContextBanner
                context={questaoContext}
                onDismiss={() => setContextDismissed(true)}
              />
            ) : null}
            {messages.map((message, index) =>
              message.role === "assistant" && !message.texto?.trim() ? null : (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "max-w-3xl",
                  message.role === "user" ? "ml-auto" : "mr-auto",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-[15px]",
                    message.role === "user"
                      ? "osmo-surface-dark bg-[#1f3dbc]/90 text-white"
                      : "border border-[var(--osmo-border)] bg-[var(--osmo-card)] text-[var(--osmo-text)] backdrop-blur-md",
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

                {message.role === "assistant" ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleGerarPdfResumo(index)}
                        disabled={pdfLoading !== null || loading}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/65 transition",
                          "hover:border-[#b0ff57]/30 hover:bg-[#b0ff57]/10 hover:text-white",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                      >
                        {pdfLoading?.index === index &&
                        pdfLoading.tipo === "resumo" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <FileText className="size-3.5" />
                        )}
                        PDF explicativo
                        <span className="text-white/35">
                          · {CUSTO_TOKENS_PDF_RESUMO} tokens
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleGerarPdfQuestoes(index)}
                        disabled={pdfLoading !== null || loading}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/65 transition",
                          "hover:border-[#b0ff57]/30 hover:bg-[#b0ff57]/10 hover:text-white",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                      >
                        {pdfLoading?.index === index &&
                        pdfLoading.tipo === "questoes" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <FileDown className="size-3.5" />
                        )}
                        PDF de questões
                        <span className="text-white/35">· grátis</span>
                      </button>
                    </div>

                    {(() => {
                      const perguntaUsuario =
                        messages[index - 1]?.role === "user"
                          ? messages[index - 1].texto
                          : "";
                      if (usuarioPediuPdfQuestoes(perguntaUsuario)) {
                        return (
                          <span className="text-[10px] text-white/35">
                            Você pediu questões — use o PDF de questões acima.
                          </span>
                        );
                      }
                      if (usuarioPediuPdf(perguntaUsuario)) {
                        return (
                          <span className="text-[10px] text-white/35">
                            Você pediu material — use o PDF explicativo acima.
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : null}
              </div>
            ))}

            {streamingText?.trim() ? (
              <div className="mr-auto max-w-3xl">
                <div className="rounded-2xl border border-[var(--osmo-border)] bg-[var(--osmo-card)] px-4 py-3 text-sm leading-relaxed text-[var(--osmo-text)] backdrop-blur-md sm:text-[15px]">
                  <p className="whitespace-pre-wrap">{streamingText}</p>
                </div>
              </div>
            ) : loading ? (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-[var(--osmo-border)] bg-[var(--osmo-card)] px-4 py-3 text-sm text-[var(--osmo-text-muted)]">
                <Loader2 className="size-4 animate-spin" />
                O tutor está pensando…
              </div>
            ) : null}

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
        <div className={cn("absolute inset-x-0 top-20 z-10", workspaceContentOffsetClass)}>
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
        subtitle="Dúvidas sobre o ENEM, simulados e trilha. Peça explicações ou treinos — não responde programação ou assuntos fora do ENEM."
        basePlaceholder="Me explica"
        suggestions={sugestoesAnimadas}
        belowHeader={
          !hasMessages ? (
            <TutorSugestoesChips
              sugestoes={chipsSugestoes}
              disabled={loading}
              onSelect={(mensagem) => void handleSubmitRef.current(mensagem)}
            />
          ) : null
        }
        buttonText="Enviar"
        loading={loading}
        onPromptSubmit={handleSubmit}
        className="h-full"
      />
    </div>
  );
}
