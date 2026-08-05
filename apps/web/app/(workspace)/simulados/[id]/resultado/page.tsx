"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { apiFetch } from "@/lib/api";
import {
  formatArea,
  type SimuladoResultado,
} from "@/lib/simulados";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SimuladoResultadoPage() {
  const params = useParams<{ id: string }>();
  const simuladoId = params.id;

  const [resultado, setResultado] = useState<SimuladoResultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  disabled
                  className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs text-white/35"
                  title="Disponível na Fase 3 (Tutor IA)"
                >
                  Explicar com IA (em breve)
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
