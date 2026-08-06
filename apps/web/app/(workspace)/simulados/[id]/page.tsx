"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { apiFetch } from "@/lib/api";
import { pedirDicaQuestao } from "@/lib/ia-tutor";
import type { SimuladoDetalhe } from "@/lib/simulados";
import { Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function renderMarkdownLite(text: string) {
  return text
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\n/g, "\n")
    .trim();
}

export default function SimuladoQuestaoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const simuladoId = params.id;
  const { setTokens } = useTokensIa();

  const [simulado, setSimulado] = useState<SimuladoDetalhe | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dica, setDica] = useState<string | null>(null);
  const [carregandoDica, setCarregandoDica] = useState(false);
  const [erroDica, setErroDica] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const data = await apiFetch<SimuladoDetalhe>(`/simulados/${simuladoId}`, {
        auth: true,
      });

      if (data.status === "CONCLUIDO" || data.concluido) {
        router.replace(`/simulados/${simuladoId}/resultado`);
        return;
      }

      setSimulado(data);
      setSelecionada(null);
      setFeedback(null);
      setDica(null);
      setErroDica(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar o simulado.",
      );
    } finally {
      setLoading(false);
    }
  }, [simuladoId, router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handlePedirDica = async () => {
    if (!simulado?.questaoAtual) return;

    setCarregandoDica(true);
    setErroDica(null);

    try {
      const response = await pedirDicaQuestao(simulado.questaoAtual.id);
      setTokens(response.tokens);
      setDica(response.resposta);
    } catch (err) {
      setErroDica(
        err instanceof Error ? err.message : "Não foi possível obter a dica.",
      );
    } finally {
      setCarregandoDica(false);
    }
  };

  const handleResponder = async () => {
    if (!simulado?.questaoAtual || !selecionada) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await apiFetch<{
        correto: boolean;
        gabarito: string;
        finalizado: boolean;
      }>(`/simulados/${simuladoId}/respostas`, {
        method: "POST",
        auth: true,
        body: {
          questaoId: simulado.questaoAtual.id,
          alternativa: selecionada,
        },
      });

      setFeedback(
        result.correto
          ? "Correto!"
          : `Incorreto. Gabarito: ${result.gabarito}`,
      );

      if (result.finalizado) {
        await apiFetch(`/simulados/${simuladoId}/finalizar`, {
          method: "POST",
          auth: true,
        });
        setTimeout(() => router.push(`/simulados/${simuladoId}/resultado`), 800);
        return;
      }

      setTimeout(() => {
        setLoading(true);
        carregar();
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar a resposta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizar = async () => {
    setSubmitting(true);
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
      setSubmitting(false);
    }
  };

  if (loading && !simulado) {
    return (
      <WorkspaceSection title="Simulado">
        <p className="text-sm text-white/45">Carregando questão…</p>
      </WorkspaceSection>
    );
  }

  if (error && !simulado) {
    return (
      <WorkspaceSection title="Simulado">
        <p className="text-sm text-red-400">{error}</p>
      </WorkspaceSection>
    );
  }

  const questao = simulado?.questaoAtual;
  const progresso = simulado
    ? `${simulado.respondidas + 1}/${simulado.totalQuestoes}`
    : "";

  return (
    <WorkspaceSection title="Simulado" contentClassName="flex min-h-0 flex-1 flex-col pt-6 pb-6">
      <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <p className="text-sm text-white/45">Questão {progresso}</p>
          <button
            type="button"
            onClick={handleFinalizar}
            disabled={submitting}
            className="text-sm text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
          >
            Finalizar agora
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 tutor-prompt-scroll">
          {questao ? (
            <article className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 md:p-8">
              <p className="mb-4 text-xs uppercase tracking-wider text-white/35">
                ENEM {questao.ano} · Questão {questao.indice}
              </p>

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
                {questao.alternativas.map((alt) => (
                  <label
                    key={alt.letra}
                    className={`flex cursor-pointer items-start gap-3 rounded-[10px] border px-4 py-3 text-sm transition ${
                      selecionada === alt.letra
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-[#111] text-white/80 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="alternativa"
                      value={alt.letra}
                      checked={selecionada === alt.letra}
                      onChange={() => setSelecionada(alt.letra)}
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

          {dica ? (
            <div className="mt-4 rounded-[14px] border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-200">
                <Lightbulb className="size-4" strokeWidth={1.75} />
                Dica do tutor
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                {dica}
              </p>
            </div>
          ) : null}

          {erroDica ? (
            <p className="mt-3 text-sm text-red-400">{erroDica}</p>
          ) : null}

          {feedback ? (
            <p
              className={`mt-4 text-sm ${feedback.startsWith("Correto") ? "text-emerald-400" : "text-amber-300"}`}
            >
              {feedback}
            </p>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        </div>

        <div className="shrink-0 space-y-3 border-t border-white/[0.06] pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePedirDica}
              disabled={!questao || carregandoDica || submitting}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/75 transition hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              {carregandoDica ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lightbulb className="size-4" strokeWidth={1.75} />
              )}
              {carregandoDica ? "Buscando dica…" : "Pedir dica (1 token IA)"}
            </button>
            <p className="self-center text-xs text-white/35">
              Sem revelar o gabarito · explicação completa após o simulado
            </p>
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
      </div>
    </WorkspaceSection>
  );
}
