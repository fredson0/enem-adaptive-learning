"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { ApiError, apiFetch } from "@/lib/api";
import { explicarErroQuestao } from "@/lib/ia-tutor";
import { formatArea, type SimuladoResultado } from "@/lib/simulados";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function buildPerguntaErro(
  ano: number,
  indice: number,
  alternativaMarcada: string | null,
  gabarito: string,
) {
  return `Por que errei a questão ENEM ${ano} #${indice}? Marquei a alternativa ${alternativaMarcada ?? "—"} e o gabarito é ${gabarito}.`;
}

export default function SimuladoResultadoPage() {
  const params = useParams<{ id: string }>();
  const simuladoId = params.id;
  const { setTokens } = useTokensIa();
  const { startChatWithSeed } = useTutorSession();

  const [resultado, setResultado] = useState<SimuladoResultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explicandoId, setExplicandoId] = useState<string | null>(null);
  const [explicarErro, setExplicarErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<SimuladoResultado>(
          `/simulados/${simuladoId}/finalizar`,
          { method: "POST", auth: true },
        );
        setResultado(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar o resultado.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [simuladoId]);

  const handleExplicarErro = async (questao: SimuladoResultado["questoes"][number]) => {
    if (!questao.alternativaMarcada) return;

    setExplicandoId(questao.id);
    setExplicarErro(null);

    try {
      const response = await explicarErroQuestao({
        questaoId: questao.id,
        alternativaMarcada: questao.alternativaMarcada,
      });

      setTokens(response.tokens);

      startChatWithSeed([
        {
          role: "user",
          texto: buildPerguntaErro(
            questao.ano,
            questao.indice,
            questao.alternativaMarcada,
            questao.gabarito,
          ),
        },
        { role: "assistant", texto: response.resposta },
      ]);
    } catch (err) {
      setExplicarErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível explicar o erro. Tente novamente.",
      );
    } finally {
      setExplicandoId(null);
    }
  };

  if (loading) {
    return (
      <WorkspaceSection title="Resultado">
        <p className="text-sm text-white/45">Calculando resultado…</p>
      </WorkspaceSection>
    );
  }

  if (error || !resultado) {
    return (
      <WorkspaceSection title="Resultado">
        <p className="text-sm text-red-400">{error ?? "Resultado indisponível"}</p>
      </WorkspaceSection>
    );
  }

  const erros = resultado.questoes.filter((q) => q.correto === false);

  return (
    <WorkspaceSection title="Resultado">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-8 text-center">
          <p className="text-5xl font-medium tracking-tight text-white">
            {resultado.acertos}/{resultado.totalQuestoes}
          </p>
          <p className="mt-2 text-sm text-white/45">
            {formatArea(resultado.area)} ·{" "}
            {Math.round((resultado.acertos / resultado.totalQuestoes) * 100)}% de
            acertos
          </p>
        </div>

        {explicarErro ? (
          <p className="rounded-[10px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {explicarErro}
          </p>
        ) : null}

        {erros.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-lg font-medium text-white">
              Questões para revisar ({erros.length})
            </h2>
            {erros.map((q) => (
              <div
                key={q.id}
                className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5"
              >
                <p className="text-xs text-white/40">
                  ENEM {q.ano} · Questão {q.indice}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-white/75">
                  {q.contexto.replace(/!\[[^\]]*]\([^)]+\)/g, "").slice(0, 200)}
                  …
                </p>
                <p className="mt-3 text-sm">
                  <span className="text-red-400">
                    Sua resposta: {q.alternativaMarcada ?? "—"}
                  </span>
                  <span className="mx-2 text-white/25">·</span>
                  <span className="text-emerald-400">Gabarito: {q.gabarito}</span>
                </p>
                <button
                  type="button"
                  disabled={explicandoId === q.id || !q.alternativaMarcada}
                  onClick={() => handleExplicarErro(q)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#b0ff57]/30 bg-[#b0ff57]/10 px-4 py-2 text-xs font-medium text-[#b0ff57] transition hover:bg-[#b0ff57]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {explicandoId === q.id ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Explicando…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Explicar com IA
                    </>
                  )}
                </button>
              </div>
            ))}
          </section>
        ) : (
          <p className="text-center text-sm text-emerald-400">
            Parabéns! Você acertou todas as questões respondidas.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/simulados/novo"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Novo simulado
          </Link>
          <Link
            href="/simulados"
            className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 transition hover:border-white/25"
          >
            Ver histórico
          </Link>
        </div>
      </div>
    </WorkspaceSection>
  );
}
