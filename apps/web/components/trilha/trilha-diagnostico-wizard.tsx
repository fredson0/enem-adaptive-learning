"use client";

import {
  AREAS_DIAGNOSTICO,
  METAS_ENEM,
  NIVEIS_CONFIANCA,
} from "@/lib/trilha-diagnostico";
import { salvarDiagnosticoTrilha } from "@/lib/trilha";
import type { AreaEnemSlug } from "@/lib/simulados";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TOTAL_PASSOS = 3;

export function TrilhaDiagnosticoWizard() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [metaEnem, setMetaEnem] = useState("");
  const [metaCustom, setMetaCustom] = useState("");
  const [autoAvaliacao, setAutoAvaliacao] = useState<
    Record<AreaEnemSlug, number>
  >({
    matematica: 3,
    linguagens: 3,
    humanas: 3,
    natureza: 3,
  });
  const [disciplinasFracas, setDisciplinasFracas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDisciplina = (disciplina: string) => {
    setDisciplinasFracas((atual) =>
      atual.includes(disciplina)
        ? atual.filter((item) => item !== disciplina)
        : [...atual, disciplina],
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await salvarDiagnosticoTrilha({
        autoAvaliacao,
        disciplinasFracas,
        metaEnem: metaEnem === "Outro curso" ? metaCustom : metaEnem,
      });
      router.push("/trilha");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar o diagnóstico.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b0ff57]">
          Diagnóstico ENEM+
        </p>
        <h2 className="text-3xl font-medium tracking-tight text-white md:text-4xl">
          Vamos montar sua trilha real
        </h2>
        <p className="text-sm leading-relaxed text-white/50">
          Responda em poucos minutos. Cruzamos seu nível declarado com seus
          simulados para priorizar cada área do ENEM.
        </p>
        <div className="flex gap-2 pt-2">
          {Array.from({ length: TOTAL_PASSOS }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= passo ? "bg-[#b0ff57]" : "bg-white/10",
              )}
            />
          ))}
        </div>
      </div>

      {passo === 0 ? (
        <section className="space-y-4 rounded-[14px] border border-white/[0.06] bg-[#161616] p-6">
          <p className="text-sm font-medium text-white">
            Qual curso você quer passar?
          </p>
          <div className="flex flex-wrap gap-2">
            {METAS_ENEM.map((meta) => (
              <button
                key={meta}
                type="button"
                onClick={() => setMetaEnem(meta)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  metaEnem === meta
                    ? "border-[#b0ff57]/40 bg-[#b0ff57]/10 text-[#b0ff57]"
                    : "border-white/10 text-white/65 hover:border-white/20",
                )}
              >
                {meta}
              </button>
            ))}
          </div>
          {metaEnem === "Outro curso" ? (
            <input
              type="text"
              value={metaCustom}
              onChange={(event) => setMetaCustom(event.target.value)}
              placeholder="Ex.: Psicologia, Enfermagem…"
              className="w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-white/25"
            />
          ) : null}
        </section>
      ) : null}

      {passo === 1 ? (
        <section className="space-y-6">
          {AREAS_DIAGNOSTICO.map((area) => (
            <div
              key={area.slug}
              className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5"
            >
              <p className="text-sm font-medium text-white">{area.label}</p>
              <p className="mt-1 text-xs text-white/40">
                Como você se sente hoje nessa área?
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-5">
                {NIVEIS_CONFIANCA.map((nivel) => (
                  <button
                    key={nivel.valor}
                    type="button"
                    onClick={() =>
                      setAutoAvaliacao((atual) => ({
                        ...atual,
                        [area.slug]: nivel.valor,
                      }))
                    }
                    className={cn(
                      "rounded-[10px] border px-2 py-3 text-center text-xs transition",
                      autoAvaliacao[area.slug] === nivel.valor
                        ? "border-white/25 bg-white/10 text-white"
                        : "border-white/10 text-white/50 hover:border-white/20",
                    )}
                  >
                    <span className="block text-lg font-medium">
                      {nivel.valor}
                    </span>
                    {nivel.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {passo === 2 ? (
        <section className="space-y-4 rounded-[14px] border border-white/[0.06] bg-[#161616] p-6">
          <p className="text-sm font-medium text-white">
            Onde você sente mais dificuldade?
          </p>
          <p className="text-xs text-white/40">
            Selecione quantas quiser — usamos isso para sugerir o foco de cada
            área.
          </p>
          <div className="space-y-5">
            {AREAS_DIAGNOSTICO.map((area) => (
              <div key={area.slug}>
                <p className="mb-2 text-xs uppercase tracking-wide text-white/35">
                  {area.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {area.disciplinas.map((disciplina) => (
                    <button
                      key={disciplina}
                      type="button"
                      onClick={() => toggleDisciplina(disciplina)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        disciplinasFracas.includes(disciplina)
                          ? "border-[#b0ff57]/40 bg-[#b0ff57]/10 text-[#b0ff57]"
                          : "border-white/10 text-white/60 hover:border-white/20",
                      )}
                    >
                      {disciplina}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={() => setPasso((atual) => Math.max(0, atual - 1))}
          disabled={passo === 0 || loading}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/25 disabled:opacity-40"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>

        {passo < TOTAL_PASSOS - 1 ? (
          <button
            type="button"
            onClick={() => setPasso((atual) => atual + 1)}
            disabled={passo === 0 && !metaEnem}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-40"
          >
            Continuar
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#b0ff57] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#c8ff7a] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Gerar minha trilha
          </button>
        )}
      </div>
    </div>
  );
}
