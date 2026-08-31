"use client";

import { ProgressoAssuntosFracos } from "@/components/progresso/progresso-assuntos-fracos";
import { ProgressoCard } from "@/components/progresso/progresso-card";
import { ProgressoCoberturaAreas } from "@/components/progresso/progresso-cobertura-areas";
import { ProgressoEnemAnos } from "@/components/progresso/progresso-enem-anos";
import { ProgressoKpiStrip } from "@/components/progresso/progresso-kpi-strip";
import { ProgressoLacunasLista } from "@/components/progresso/progresso-lacunas-lista";
import { ProgressoSectionShell } from "@/components/progresso/progresso-section-shell";
import { ProgressoTrilhaResumo } from "@/components/progresso/progresso-trilha-resumo";
import type { ProgressoDataProps } from "@/components/progresso/progresso-view";
import { obterProximaAcaoTrilha } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  Route,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";

const AREA_LACUNA_GRADIENTS: Record<string, string> = {
  matematica: "from-[#1a2a4a]/80 via-[#161616] to-[#111]",
  linguagens: "from-[#3a1a2a]/80 via-[#161616] to-[#111]",
  humanas: "from-[#3a2a10]/80 via-[#161616] to-[#111]",
  natureza: "from-[#103a2a]/80 via-[#161616] to-[#111]",
};

export function ProgressoFocoView({
  lacunas,
  trilha,
  cobertura,
  onTrilhaAtualizada,
}: ProgressoDataProps & {
  onTrilhaAtualizada?: (trilha: import("@/lib/trilha").TrilhaResponse) => void;
}) {
  const { startChatWithSeed } = useTutorSession();
  const [abrindoTutor, setAbrindoTutor] = useState(false);

  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const proximaTrilha = obterProximaAcaoTrilha(trilha);
  const anosCompletos = cobertura?.anos.filter((a) => a.completo).length ?? 0;
  const totalAnos = cobertura?.anos.length ?? 0;
  const assuntosFracos =
    cobertura?.assuntos.filter((a) => a.percentual < 50).length ?? 0;

  const hrefSimuladoFocado = lacunaPrincipal
    ? `/simulados/treino/novo?area=${lacunaPrincipal.simuladoSugerido.area}&quantidade=${lacunaPrincipal.simuladoSugerido.quantidade}`
    : "/simulados/treino/novo?quantidade=5";

  const labelTreino = lacunaPrincipal
    ? `Treino em ${lacunaPrincipal.label} · ${lacunaPrincipal.simuladoSugerido.quantidade} questões`
    : "Treino guiado · 5 questões";

  const abrirTutorLacuna = async () => {
    if (!lacunaPrincipal || abrindoTutor) return;

    setAbrindoTutor(true);
    try {
      await startChatWithSeed([
        { role: "user", texto: lacunaPrincipal.perguntaTutor },
      ]);
    } finally {
      setAbrindoTutor(false);
    }
  };

  return (
    <ProgressoSectionShell
      title="Foco agora"
      description="Priorize a lacuna mais importante, avance na trilha e cubra provas do ENEM que ainda faltam."
    >
      <div className="space-y-3 md:space-y-4">
        <ProgressoKpiStrip
          items={[
            {
              label: "Lacuna #1",
              value: lacunaPrincipal?.label ?? "—",
              hint: lacunaPrincipal
                ? `${lacunaPrincipal.score}% de acerto`
                : "Sem prioridade",
              accent: "warning",
            },
            {
              label: "Assuntos fracos",
              value: String(assuntosFracos),
              hint: "abaixo de 50%",
            },
            {
              label: "Provas ENEM",
              value: totalAnos > 0 ? `${anosCompletos}/${totalAnos}` : "—",
              hint: "anos com 100%",
              accent: anosCompletos === totalAnos && totalAnos > 0 ? "positive" : "default",
            },
            {
              label: "Lacunas",
              value: String(lacunas.lacunas.length),
              hint: "áreas priorizadas",
            },
          ]}
        />

        <section
          className={cn(
            "osmo-surface-dark overflow-hidden rounded-2xl border p-4 sm:rounded-[20px] sm:p-5",
            lacunaPrincipal
              ? cn(
                  "border-white/[0.08] bg-gradient-to-br",
                  AREA_LACUNA_GRADIENTS[lacunaPrincipal.slug] ??
                    "from-[#161616] to-[#111]",
                )
              : "border-white/[0.08] bg-[#161616]",
          )}
        >
          {lacunaPrincipal ? (
            <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/55 sm:text-[10px]">
                Próximo passo · {lacunaPrincipal.label}
              </span>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] text-amber-300/90">
                Prioridade {lacunaPrincipal.prioridade}
              </span>
            </div>
          ) : (
            <p className="text-[9px] uppercase tracking-[0.14em] text-white/35 sm:text-[10px]">
              Próximo passo
            </p>
          )}

          <p className="text-base font-medium leading-snug text-white sm:text-lg">
            {labelTreino}
          </p>

          {lacunaPrincipal ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {lacunaPrincipal.mensagem}
              </p>
              <p className="mt-2 text-xs text-white/40">
                {lacunaPrincipal.acertos}/{lacunaPrincipal.totalQuestoes} acertos
                no banco · score {lacunaPrincipal.score}%
              </p>
            </>
          ) : null}

          <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Link
                href={hrefSimuladoFocado}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-osmo-accent px-5 py-2.5 text-sm font-medium transition hover:opacity-90 sm:w-auto"
              >
                Começar treino
                <ArrowRight className="size-4" />
              </Link>

              {lacunaPrincipal ? (
                <button
                  type="button"
                  onClick={abrirTutorLacuna}
                  disabled={abrindoTutor}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/25 hover:bg-white/[0.08] disabled:opacity-60 sm:w-auto"
                >
                  <MessageSquare className="size-4 text-osmo-accent" />
                  {abrindoTutor ? "Abrindo…" : "Perguntar ao tutor"}
                </button>
              ) : null}
            </div>

            {proximaTrilha ? (
              <Link
                href={proximaTrilha.href}
                className="inline-flex items-center gap-1 text-sm text-white/45 transition hover:text-white/70"
              >
                {proximaTrilha.titulo}
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/trilha"
                className="inline-flex items-center gap-1 text-sm text-white/45 transition hover:text-white/70"
              >
                Continuar trilha
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <ProgressoCard
            icon={<Target className="size-4" />}
            title="Todas as lacunas"
            className="md:col-span-2"
          >
            <ProgressoLacunasLista
              lacunas={lacunas.lacunas}
              destacarPrincipal={false}
            />
          </ProgressoCard>

          <ProgressoCard
            icon={<Route className="size-4" />}
            title="Trilha personalizada"
            className="md:col-span-2"
          >
            <ProgressoTrilhaResumo
              trilha={trilha}
              onTrilhaAtualizada={onTrilhaAtualizada}
            />
          </ProgressoCard>

          {cobertura?.assuntos?.length ? (
            <ProgressoCard
              icon={<BookOpen className="size-4" />}
              title="Assuntos para revisar"
              className="md:col-span-1"
            >
              <p className="mb-3 text-[11px] text-osmo-subtle">
                Tópicos com menor domínio no banco de questões.
              </p>
              <ProgressoAssuntosFracos assuntos={cobertura.assuntos} />
            </ProgressoCard>
          ) : null}

          {cobertura?.areas?.length ? (
            <ProgressoCard
              icon={<Target className="size-4" />}
              title="Cobertura por área"
              className={cn(
                cobertura?.assuntos?.length ? "md:col-span-1" : "md:col-span-2",
              )}
            >
              <ProgressoCoberturaAreas areas={cobertura.areas} />
            </ProgressoCard>
          ) : null}

          {cobertura?.anos?.length ? (
            <ProgressoCard
              icon={<Target className="size-4" />}
              title="Provas ENEM por ano"
              className="md:col-span-2"
              footer={
                <Link
                  href="/simulados/treino/novo?priorizar=1"
                  className="text-xs text-osmo-subtle transition hover:text-osmo-muted"
                >
                  Simulado com questões novas →
                </Link>
              }
            >
              <p className="mb-3 text-[11px] text-osmo-subtle">
                Toque em um ano para treinar questões que ainda faltam.
              </p>
              <ProgressoEnemAnos anos={cobertura.anos} />
            </ProgressoCard>
          ) : null}
        </div>
      </div>
    </ProgressoSectionShell>
  );
}
