"use client";

import { EnunciadoRichText } from "@/components/simulados/enunciado-rich-text";
import { SimuladoDicaPanel } from "@/components/simulados/simulado-dica-panel";
import { SimuladoFinalizarDialog } from "@/components/simulados/simulado-finalizar-dialog";
import { SimuladoNavegacaoStrip } from "@/components/simulados/simulado-navegacao-strip";
import { SimuladoProgressBar } from "@/components/simulados/simulado-progress-bar";
import { SimuladoTimer } from "@/components/simulados/simulado-timer";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { apiFetch } from "@/lib/api";
import { pedirDicaQuestao } from "@/lib/ia-tutor";
import { obterSimulado } from "@/lib/simulados-api";
import { cn } from "@/lib/utils";
import { formatModoSimulado } from "@/lib/simulado-modos";
import type { SimuladoDetalhe } from "@/lib/simulados";
import { Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const ATALHOS_ALTERNATIVA: Record<string, string> = {
  a: "A",
  b: "B",
  c: "C",
  d: "D",
  e: "E",
};

export default function SimuladoQuestaoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const simuladoId = params.id;
  const { setTokens } = useTokensIa();
  const finalizandoRef = useRef(false);

  const [simulado, setSimulado] = useState<SimuladoDetalhe | null>(null);
  const [ordemVisualizada, setOrdemVisualizada] = useState<number | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dicasPorQuestao, setDicasPorQuestao] = useState<Record<string, string>>(
    {},
  );
  const [painelDicaVisivel, setPainelDicaVisivel] = useState(false);
  const [carregandoDica, setCarregandoDica] = useState(false);
  const [erroDica, setErroDica] = useState<string | null>(null);
  const [dialogFinalizarAberto, setDialogFinalizarAberto] = useState(false);

  const carregar = useCallback(
    async (ordem?: number) => {
      try {
        const data = await obterSimulado(
          simuladoId,
          ordem !== undefined ? ordem : undefined,
        );

        if (data.status === "CONCLUIDO" || data.concluido) {
          router.replace(`/simulados/${simuladoId}/resultado`);
          return;
        }

        setSimulado(data);
        setOrdemVisualizada(data.questaoAtualIdx);

        if (data.modoVisualizacao === "revisao" && data.respostaAtual) {
          setSelecionada(data.respostaAtual.alternativa);
        } else {
          setSelecionada(null);
        }

        setFeedback(null);
        setPainelDicaVisivel(false);
        setErroDica(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar o simulado.",
        );
      } finally {
        setLoading(false);
      }
    },
    [simuladoId, router],
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  const emRevisao = simulado?.modoVisualizacao === "revisao";
  const indiceProgresso = simulado?.indiceProgresso ?? simulado?.respondidas ?? 0;

  const handleNavegar = useCallback(
    (ordem: number) => {
      if (ordem === ordemVisualizada) return;
      setLoading(true);
      carregar(ordem);
    },
    [carregar, ordemVisualizada],
  );

  const voltarQuestaoAtual = () => {
    if (indiceProgresso === ordemVisualizada) return;
    setLoading(true);
    carregar(indiceProgresso);
  };

  const handleFinalizar = useCallback(async () => {
    if (finalizandoRef.current) return;
    finalizandoRef.current = true;
    setSubmitting(true);
    setDialogFinalizarAberto(false);

    try {
      await apiFetch(`/simulados/${simuladoId}/finalizar`, {
        method: "POST",
        auth: true,
      });
      router.push(`/simulados/${simuladoId}/resultado`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível finalizar.",
      );
      finalizandoRef.current = false;
      setSubmitting(false);
    }
  }, [simuladoId, router]);

  const handlePedirDica = async () => {
    if (!simulado?.questaoAtual || emRevisao) return;

    const questaoId = simulado.questaoAtual.id;
    const dicaEmCache = dicasPorQuestao[questaoId];

    setPainelDicaVisivel(true);
    setErroDica(null);

    if (dicaEmCache) {
      return;
    }

    setCarregandoDica(true);

    try {
      const response = await pedirDicaQuestao(questaoId);
      setTokens(response.tokens);
      setDicasPorQuestao((atual) => ({
        ...atual,
        [questaoId]: response.resposta,
      }));
    } catch (err) {
      setErroDica(
        err instanceof Error ? err.message : "Não foi possível obter a dica.",
      );
    } finally {
      setCarregandoDica(false);
    }
  };

  const fecharDica = () => {
    setPainelDicaVisivel(false);
    setErroDica(null);
    setCarregandoDica(false);
  };

  const handleResponder = useCallback(async () => {
    if (!simulado?.questaoAtual || !selecionada || emRevisao) return;

    setSubmitting(true);
    setError(null);

    const idempotencyKey = `resposta:${simuladoId}:${simulado.questaoAtual.id}`;

    try {
      const result = await apiFetch<{
        correto: boolean;
        gabarito: string | null;
        revelarGabaritoImediato: boolean;
        finalizado: boolean;
      }>(`/simulados/${simuladoId}/respostas`, {
        method: "POST",
        auth: true,
        idempotencyKey,
        body: {
          questaoId: simulado.questaoAtual.id,
          alternativa: selecionada,
        },
      });

      if (result.revelarGabaritoImediato) {
        setFeedback(
          result.correto
            ? "Correto!"
            : `Incorreto.${result.gabarito ? ` Gabarito: ${result.gabarito}` : ""}`,
        );
      } else {
        setFeedback(result.correto ? "Resposta registrada." : "Resposta registrada.");
      }

      if (result.finalizado) {
        setTimeout(() => handleFinalizar(), 800);
        return;
      }

      setTimeout(() => {
        fecharDica();
        setTimeout(() => {
          setLoading(true);
          carregar();
        }, 450);
      }, result.revelarGabaritoImediato ? 900 : 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar a resposta.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [simulado, selecionada, emRevisao, simuladoId, handleFinalizar, carregar]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (emRevisao || submitting || !simulado?.questaoAtual) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const letra = ATALHOS_ALTERNATIVA[event.key.toLowerCase()];
      if (letra) {
        const existe = simulado.questaoAtual.alternativas.some(
          (alt) => alt.letra === letra,
        );
        if (existe) {
          event.preventDefault();
          setSelecionada(letra);
        }
        return;
      }

      if (event.key === "Enter" && selecionada) {
        event.preventDefault();
        handleResponder();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [emRevisao, submitting, simulado, selecionada, handleResponder]);

  if (loading && !simulado) {
    return (
      <WorkspaceSection>
        <p className="text-sm text-white/45">Carregando questão…</p>
      </WorkspaceSection>
    );
  }

  if (error && !simulado) {
    return (
      <WorkspaceSection>
        <p className="text-sm text-red-400">{error}</p>
      </WorkspaceSection>
    );
  }

  const questao = simulado?.questaoAtual;
  const questaoNumero = (ordemVisualizada ?? simulado?.respondidas ?? 0) + 1;
  const dicaAtual = questao ? (dicasPorQuestao[questao.id] ?? null) : null;
  const jaTemDica = Boolean(dicaAtual);
  const painelDicaAberto =
    painelDicaVisivel && Boolean(dicaAtual || carregandoDica || erroDica);

  return (
    <WorkspaceSection contentClassName="pb-24 md:pb-6">
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-5 transition-[max-width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
          painelDicaAberto
            ? "max-w-6xl min-h-0 flex-1"
            : "max-w-4xl",
        )}
      >
        <div className="shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-white/40">
              {simulado ? formatModoSimulado(simulado.modo) : ""}
            </p>
            {simulado?.tempoLimiteSegundos ? (
              <SimuladoTimer
                tempoLimiteSegundos={simulado.tempoLimiteSegundos}
                iniciadoEm={simulado.iniciadoEm}
                onExpirado={handleFinalizar}
              />
            ) : null}
          </div>

          {simulado ? (
            <SimuladoProgressBar
              atual={questaoNumero}
              total={simulado.totalQuestoes}
            />
          ) : null}

          {simulado?.navegacao?.length ? (
            <SimuladoNavegacaoStrip
              navegacao={simulado.navegacao}
              ordemAtual={ordemVisualizada ?? simulado.questaoAtualIdx}
              indiceProgresso={indiceProgresso}
              onSelecionar={handleNavegar}
            />
          ) : null}

          {emRevisao ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-white/10 bg-white/5 px-4 py-2">
              <p className="text-xs text-white/55">
                Modo revisão — questão {questaoNumero}
                {simulado?.respostaAtual
                  ? simulado.respostaAtual.correto
                    ? " · acerto"
                    : " · erro"
                  : ""}
              </p>
              <button
                type="button"
                onClick={voltarQuestaoAtual}
                className="text-xs text-white/70 underline-offset-2 hover:text-white hover:underline"
              >
                Voltar à questão atual
              </button>
            </div>
          ) : (
            <p className="hidden text-xs text-white/30 md:block">
              Atalhos: teclas A–E para marcar · Enter para confirmar
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setDialogFinalizarAberto(true)}
              disabled={submitting}
              className="text-sm text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
            >
              Finalizar agora
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none lg:gap-6",
            painelDicaAberto && "min-h-0 flex-1 lg:grid-cols-2",
          )}
        >
          <div
            className={cn(
              painelDicaAberto &&
                "min-h-0 overflow-y-auto overscroll-contain pr-1 tutor-prompt-scroll lg:max-h-[calc(100vh-14rem)]",
            )}
          >
            {questao ? (
              <article className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 md:p-8 lg:p-10">
              <p className="mb-4 text-xs uppercase tracking-wider text-white/35">
                ENEM {questao.ano} · Questão {questao.indice}
              </p>

              {questao.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={questao.imagemUrl}
                  alt=""
                  className="mb-6 max-h-96 w-full rounded-lg object-contain"
                />
              ) : null}

              <EnunciadoRichText
                text={questao.contexto}
                className="text-base text-white/85"
              />

              {questao.introducaoAlternativas ? (
                <p className="mt-6 text-sm text-white/60">
                  {questao.introducaoAlternativas}
                </p>
              ) : null}

              <div className="mt-6 space-y-2">
                {questao.alternativas.map((alt) => (
                  <label
                    key={alt.letra}
                    className={cn(
                      "flex items-start gap-3 rounded-[10px] border px-4 py-3 text-sm transition",
                      emRevisao ? "cursor-default" : "cursor-pointer",
                      selecionada === alt.letra
                        ? emRevisao && simulado?.respostaAtual?.correto
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                          : emRevisao && !simulado?.respostaAtual?.correto
                            ? "border-red-500/40 bg-red-500/10 text-red-100"
                            : "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-[#111] text-white/80",
                      !emRevisao && selecionada !== alt.letra && "hover:border-white/20",
                    )}
                  >
                    <input
                      type="radio"
                      name="alternativa"
                      value={alt.letra}
                      checked={selecionada === alt.letra}
                      onChange={() => !emRevisao && setSelecionada(alt.letra)}
                      disabled={emRevisao}
                      className="mt-1"
                    />
                    <span>
                      <strong className="mr-2">{alt.letra})</strong>
                      {alt.texto}
                    </span>
                  </label>
                ))}
              </div>
            </article>
          ) : (
            <p className="text-sm text-white/50">Nenhuma questão pendente.</p>
          )}

            {feedback ? (
              <p
                className={cn(
                  "mt-4 text-sm",
                  feedback.startsWith("Correto") || feedback.startsWith("Resposta")
                    ? "text-emerald-400"
                    : "text-amber-300",
                )}
              >
                {feedback}
              </p>
            ) : null}

            {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          </div>

          <SimuladoDicaPanel
            aberto={painelDicaAberto}
            dica={dicaAtual}
            carregando={carregandoDica}
            erro={erroDica}
            onFechar={fecharDica}
          />
        </div>

        {!emRevisao ? (
          <>
            <div className="hidden space-y-3 border-t border-white/[0.06] pt-5 md:block">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePedirDica}
                  disabled={
                    !questao ||
                    carregandoDica ||
                    submitting ||
                    (painelDicaVisivel && jaTemDica)
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/75 transition hover:border-white/25 hover:text-white disabled:opacity-50"
                >
                  {carregandoDica ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Lightbulb className="size-4" strokeWidth={1.75} />
                  )}
                  {carregandoDica
                    ? "Buscando dica…"
                    : jaTemDica
                      ? painelDicaVisivel
                        ? "Dica aberta"
                        : "Ver dica"
                      : "Pedir dica (1 token IA)"}
                </button>
                {!simulado?.revelarGabaritoImediato ? (
                  <p className="self-center text-xs text-white/35">
                    Gabarito só no resultado final
                  </p>
                ) : (
                  <p className="self-center text-xs text-white/35">
                    Sem revelar gabarito na dica
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleResponder}
                  disabled={!selecionada || submitting}
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {submitting ? "Enviando…" : "Confirmar resposta"}
                </button>
                <Link
                  href="/simulados"
                  className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 transition hover:border-white/25"
                >
                  Voltar
                </Link>
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[var(--osmo-canvas)]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePedirDica}
                  disabled={
                    !questao ||
                    carregandoDica ||
                    submitting ||
                    (painelDicaVisivel && jaTemDica)
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-3 text-xs text-white/75 transition hover:border-white/25 disabled:opacity-50"
                >
                  {carregandoDica ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Lightbulb className="size-4 shrink-0" strokeWidth={1.75} />
                  )}
                  <span className="truncate">
                    {carregandoDica
                      ? "Dica…"
                      : jaTemDica
                        ? painelDicaVisivel
                          ? "Dica"
                          : "Ver dica"
                        : "Dica IA"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleResponder}
                  disabled={!selecionada || submitting}
                  className="flex-[1.4] rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {submitting ? "Enviando…" : "Confirmar"}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <SimuladoFinalizarDialog
        open={dialogFinalizarAberto}
        onClose={() => setDialogFinalizarAberto(false)}
        onConfirm={handleFinalizar}
        respondidas={simulado?.respondidas ?? 0}
        totalQuestoes={simulado?.totalQuestoes ?? 0}
        submitting={submitting}
      />
    </WorkspaceSection>
  );
}
