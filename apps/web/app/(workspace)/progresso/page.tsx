"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import {
  fetchEvolucao,
  fetchProficiencia,
  type PontoEvolucao,
  type ProficienciaResponse,
} from "@/lib/metricas";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function EvolucaoChart({ pontos }: { pontos: PontoEvolucao[] }) {
  if (pontos.length === 0) {
    return (
      <p className="text-sm text-white/45">
        Conclua simulados para ver sua evolução aqui.
      </p>
    );
  }

  const max = Math.max(...pontos.map((p) => p.percentual), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {pontos.map((ponto) => (
        <div
          key={ponto.simuladoId}
          className="group flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/40 opacity-0 transition group-hover:opacity-100">
            {ponto.percentual}%
          </span>
          <div
            className="w-full rounded-t-md bg-white/80 transition-all group-hover:bg-white"
            style={{ height: `${Math.max((ponto.percentual / max) * 100, 8)}%` }}
            title={`${ponto.label ?? "Geral"} — ${ponto.acertos}/${ponto.totalQuestoes}`}
          />
          <span className="truncate text-[10px] text-white/35">
            {formatDate(ponto.finalizadoEm)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressoPage() {
  const [data, setData] = useState<ProficienciaResponse | null>(null);
  const [evolucao, setEvolucao] = useState<PontoEvolucao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchProficiencia(), fetchEvolucao()])
      .then(([prof, evo]) => {
        setData(prof);
        setEvolucao(evo.pontos);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar progresso.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const areas = data?.areas ?? [];

  return (
    <WorkspaceSection title="Progresso" count={areas.length || undefined}>
      <div className="space-y-8">
        {loading ? (
          <p className="text-sm text-white/45">Carregando seu progresso…</p>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {data ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
              <p className="text-sm text-white/45">Simulados concluídos</p>
              <p className="mt-2 text-3xl font-medium text-white">
                {data.resumo.simuladosConcluidos}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
              <p className="text-sm text-white/45">Questões respondidas</p>
              <p className="mt-2 text-3xl font-medium text-white">
                {data.resumo.questoesRespondidas}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
              <p className="text-sm text-white/45">Média geral</p>
              <p className="mt-2 text-3xl font-medium text-white">
                {data.resumo.mediaGeralPercentual ?? "—"}
                {data.resumo.mediaGeralPercentual !== null ? (
                  <span className="text-lg text-white/35">%</span>
                ) : null}
              </p>
            </div>
          </div>
        ) : null}

        {data?.ultimoSimulado ? (
          <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6">
            <p className="text-sm text-white/45">Último simulado</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-medium text-white">
                  {data.ultimoSimulado.acertos}/{data.ultimoSimulado.totalQuestoes}
                  <span className="ml-2 text-lg text-white/40">
                    ({data.ultimoSimulado.percentual}%)
                  </span>
                </p>
                <p className="mt-1 text-sm text-white/45">
                  {data.ultimoSimulado.label ?? "Geral"}
                  {data.ultimoSimulado.finalizadoEm
                    ? ` · ${formatDate(data.ultimoSimulado.finalizadoEm)}`
                    : ""}
                </p>
              </div>
              <Link
                href={`/simulados/${data.ultimoSimulado.id}/resultado`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Ver resultado
              </Link>
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-medium text-white">Proficiência por área</h2>
            <Link
              href="/trilha"
              className="text-xs text-white/40 underline-offset-2 hover:text-white/65 hover:underline"
            >
              Ir para minha trilha →
            </Link>
          </div>
          {areas.length === 0 && !loading ? (
            <p className="text-sm text-white/45">
              Faça seu primeiro simulado para ver sua proficiência por área.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {areas.map((item) => (
                <div
                  key={item.area}
                  className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
                >
                  <p className="text-sm text-white/45">{item.label}</p>
                  <p className="mt-3 text-4xl font-medium tracking-tight text-white">
                    {item.score}
                    <span className="text-xl text-white/35">%</span>
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {item.totalQuestoes > 0
                      ? `${item.acertos}/${item.totalQuestoes} acertos`
                      : "Sem prática ainda"}
                  </p>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-white/80"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Evolução</h2>
          <EvolucaoChart pontos={evolucao} />
        </div>
      </div>
    </WorkspaceSection>
  );
}
