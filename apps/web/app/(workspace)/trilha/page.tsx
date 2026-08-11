"use client";

import { TrilhaAreaCard } from "@/components/trilha/trilha-area-card";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { fetchTrilha, type TrilhaResponse } from "@/lib/trilha";
import { Clock, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TrilhaPage() {
  const router = useRouter();
  const { startChatWithSeed } = useTutorSession();
  const [data, setData] = useState<TrilhaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrilha()
      .then((response) => {
        if (!response.diagnosticoCompleto) {
          router.replace("/trilha/diagnostico");
          return;
        }
        setData(response);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar a trilha.",
        ),
      )
      .finally(() => setLoading(false));
  }, [router]);

  const abrirTutor = (pergunta: string) => {
    startChatWithSeed([{ role: "user", texto: pergunta }]);
  };

  if (loading) {
    return (
      <WorkspaceSection title="Trilha">
        <p className="text-sm text-white/45">Montando sua trilha personalizada…</p>
      </WorkspaceSection>
    );
  }

  if (error || !data) {
    return (
      <WorkspaceSection title="Trilha">
        <p className="text-sm text-red-400">{error ?? "Trilha indisponível"}</p>
      </WorkspaceSection>
    );
  }

  const areaDestaque = data.areas[0];
  const demaisAreas = data.areas.slice(1);

  return (
    <WorkspaceSection title="Trilha">
      <div className="space-y-10">
        <header className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b0ff57]">
              Sua trilha
            </p>
            <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-white md:text-4xl">
              Um plano objetivo para cada área do ENEM
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/50">
              {data.metaSemanal}
            </p>
            {data.metaEnem ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-1.5 text-xs text-white/60">
                <Sparkles className="size-3.5 text-[#b0ff57]" />
                Objetivo: {data.metaEnem}
              </p>
            ) : null}
          </div>

          <aside className="space-y-3 rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 size-4 text-white/45" strokeWidth={1.75} />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/35">
                  Meta da semana
                </p>
                <p className="mt-1 text-sm text-white/70">{data.metaSemanal}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/[0.06] pt-3">
              <Clock className="mt-0.5 size-4 text-white/45" strokeWidth={1.75} />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/35">
                  Tempo sugerido
                </p>
                <p className="mt-1 text-sm text-white/70">
                  ~{Math.max(30, Math.round(data.tempoDiarioMinutos / 4))} min/dia na
                  área prioritária
                </p>
              </div>
            </div>
            <Link
              href="/trilha/diagnostico"
              className="block text-xs text-white/40 underline-offset-2 hover:text-white/65 hover:underline"
            >
              Refazer diagnóstico
            </Link>
          </aside>
        </header>

        {areaDestaque ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/35">
                  Prioridade agora
                </p>
                <h3 className="text-xl font-medium text-white">
                  {areaDestaque.label}
                </h3>
              </div>
            </div>
            <div className="max-w-3xl">
              <TrilhaAreaCard
                area={areaDestaque}
                destaque
                onAbrirTutor={abrirTutor}
              />
            </div>
          </section>
        ) : null}

        {demaisAreas.length > 0 ? (
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-white/70">
              Outras áreas do ENEM
            </h3>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {demaisAreas.map((area) => (
                <TrilhaAreaCard
                  key={area.slug}
                  area={area}
                  onAbrirTutor={abrirTutor}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </WorkspaceSection>
  );
}
