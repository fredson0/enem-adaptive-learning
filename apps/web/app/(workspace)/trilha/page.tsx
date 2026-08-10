"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import {
  fetchLacunas,
  type LacunasResponse,
} from "@/lib/metricas";
import { BookOpen, ChevronRight, MessageCircle, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PRIORIDADE_STYLES = {
  Alta: "bg-red-500/15 text-red-300",
  Média: "bg-amber-500/15 text-amber-300",
  Baixa: "bg-emerald-500/15 text-emerald-300",
} as const;

export default function TrilhaPage() {
  const { startChatWithSeed } = useTutorSession();
  const [data, setData] = useState<LacunasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLacunas()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar a trilha.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const lacunas = data?.lacunas ?? [];

  const abrirTutor = (pergunta: string) => {
    startChatWithSeed([{ role: "user", texto: pergunta }]);
  };

  return (
    <WorkspaceSection title="Trilha" count={lacunas.length}>
      <div className="space-y-8">
        {loading ? (
          <p className="text-sm text-white/45">Montando sua trilha personalizada…</p>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {data ? (
          <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 size-5 shrink-0 text-white/50" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium text-white">Meta da semana</p>
                <p className="mt-1 text-sm text-white/50">{data.metaSemanal}</p>
              </div>
            </div>
          </div>
        ) : null}

        {data?.checklist ? (
          <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6">
            <p className="mb-4 text-sm font-medium text-white">Checklist</p>
            <ul className="space-y-3">
              {data.checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm text-white/55">
                  <span className="size-4 rounded border border-white/15" />
                  {item.texto}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!loading && lacunas.length === 0 ? (
          <p className="text-sm text-white/45">
            Complete um simulado para receber recomendações personalizadas.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lacunas.map((item) => (
            <div
              key={item.area}
              className="group overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#161616] transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
            >
              <div className="relative flex aspect-[16/10] items-end bg-gradient-to-br from-[#222] via-[#171717] to-[#111] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,107,107,0.08),transparent_55%)]" />
                <span
                  className={`relative rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase ${PRIORIDADE_STYLES[item.prioridade]}`}
                >
                  {item.prioridade}
                </span>
              </div>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-sm text-white/40">
                    {item.score}% de acerto
                    {item.totalQuestoes > 0
                      ? ` · ${item.acertos}/${item.totalQuestoes} questões`
                      : ""}
                  </p>
                  <p className="mt-2 text-sm text-white/50">{item.mensagem}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/simulados/modalidade/novo?area=${item.simuladoSugerido.area}&quantidade=${item.simuladoSugerido.quantidade}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/90"
                  >
                    <BookOpen className="size-3.5" strokeWidth={1.75} />
                    Simulado focado
                    <ChevronRight className="size-3" strokeWidth={1.75} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => abrirTutor(item.perguntaTutor)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
                  >
                    <MessageCircle className="size-3.5" strokeWidth={1.75} />
                    Perguntar ao tutor
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceSection>
  );
}
