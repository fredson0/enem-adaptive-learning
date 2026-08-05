"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { apiFetch } from "@/lib/api";
import type { SimuladoDetalhe } from "@/lib/simulados";
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

  const [simulado, setSimulado] = useState<SimuladoDetalhe | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <WorkspaceSection title="Simulado">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
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

        {feedback ? (
          <p
            className={`text-sm ${feedback.startsWith("Correto") ? "text-emerald-400" : "text-amber-300"}`}
          >
            {feedback}
          </p>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex gap-3">
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
    </WorkspaceSection>
  );
}
