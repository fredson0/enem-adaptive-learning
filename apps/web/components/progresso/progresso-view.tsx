"use client";

import { ProgressArcGauge } from "@/components/progresso/progress-arc-gauge";
import { ProgressoAreasList } from "@/components/progresso/progresso-areas-list";
import { ProgressoEnemAnos } from "@/components/progresso/progresso-enem-anos";
import { ProgressoCard } from "@/components/progresso/progresso-card";
import { ProgressoEvolucaoChart } from "@/components/progresso/progresso-evolucao-chart";
import { ProgressoRadarChart } from "@/components/progresso/progresso-radar-chart";
import { ProgressoSegmentedBar } from "@/components/progresso/progresso-segmented-bar";
import { ProgressoStreakCard } from "@/components/progresso/progresso-streak-card";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import type {
  LacunasResponse,
  CoberturaResponse,
  ProficienciaResponse,
  PontoEvolucao,
} from "@/lib/metricas";
import {
  calcularRitmoSemanal,
  calcularTendenciaGeral,
  calcularTendenciasPorArea,
  formatarLinhaTendencia,
  montarSegmentosPorArea,
  montarSubtituloProgresso,
  obterProximaAcaoTrilha,
  ordenarAreasPorPrioridade,
} from "@/lib/progresso-helpers";
import type { TrilhaResponse } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronRight,
  MessageSquare,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const AREA_LACUNA_GRADIENTS: Record<string, string> = {
  matematica: "from-[#1a2a4a]/80 via-[#161616] to-[#111]",
  linguagens: "from-[#3a1a2a]/80 via-[#161616] to-[#111]",
  humanas: "from-[#3a2a10]/80 via-[#161616] to-[#111]",
  natureza: "from-[#103a2a]/80 via-[#161616] to-[#111]",
};

export type ProgressoDataProps = {
  proficiencia: ProficienciaResponse;
  evolucao: PontoEvolucao[];
  lacunas: LacunasResponse;
  trilha: TrilhaResponse | null;
  cobertura?: CoberturaResponse | null;
};

function LinhaTendencia({ texto }: { texto: string }) {
  const positivo = texto.startsWith("+");
  const negativo = texto.startsWith("-");

  return (
    <p
      className={cn(
        "text-sm",
        positivo && "text-osmo-accent",
        negativo && "text-red-400/85",
        !positivo && !negativo && "text-osmo-subtle",
      )}
    >
      {texto}
    </p>
  );
}

/** Home — dashboard modular com cards. */
export function ProgressoView({
  proficiencia,
  evolucao,
  lacunas,
  trilha,
  cobertura,
}: ProgressoDataProps) {
  const { startChatWithSeed } = useTutorSession();
  const [abrindoTutor, setAbrindoTutor] = useState(false);

  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const tendenciaGeral = calcularTendenciaGeral(evolucao);
  const tendenciasArea = calcularTendenciasPorArea(evolucao);
  const ritmoSemanal = calcularRitmoSemanal(evolucao);
  const mediaExibida = proficiencia.resumo.mediaGeralPercentual ?? 0;
  const areasOrdenadas = ordenarAreasPorPrioridade(
    proficiencia.areas,
    lacunas.lacunas,
  );
  const segmentos = montarSegmentosPorArea(proficiencia.areas);
  const totalQuestoes = proficiencia.resumo.questoesRespondidas;
  const proximaTrilha = obterProximaAcaoTrilha(trilha);
  const semDados = proficiencia.resumo.simuladosConcluidos === 0;
  const temGraficoEvolucao = evolucao.length >= 3;

  const linhaTendencia = formatarLinhaTendencia(
    tendenciaGeral,
    proficiencia.resumo.simuladosConcluidos,
  );
  const subtitulo = montarSubtituloProgresso(lacunaPrincipal);

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

  if (semDados) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 py-4 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-osmo-subtle">
            Progresso
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-osmo md:text-3xl">
            Comece hoje
          </h2>
          <p className="text-sm leading-relaxed text-osmo-muted">
            5 questões bastam para ver seu mapa de proficiência por área.
          </p>
        </div>

        <Link
          href="/simulados/treino/novo?quantidade=5"
          className="inline-flex items-center gap-2 rounded-full bg-osmo-accent px-6 py-3 text-sm font-medium transition hover:opacity-90"
        >
          Fazer primeiro treino
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 py-1 sm:gap-4 sm:py-2">
      <header className="px-0.5 pt-1">
        <p className="inline-flex max-w-full rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-3 py-1.5 text-xs leading-snug text-osmo-muted">
          {subtitulo}
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <ProgressoStreakCard ritmo={ritmoSemanal} />

        <ProgressoCard
          icon={<Target className="size-4" />}
          title="Média geral"
          footer={
            linhaTendencia ? (
              <LinhaTendencia texto={linhaTendencia} />
            ) : undefined
          }
        >
          <div className="flex justify-center py-0 sm:py-1">
            <ProgressArcGauge
              percent={mediaExibida}
              labelLeft={`${mediaExibida}%`}
              labelRight="média geral"
              className="max-w-[180px] sm:max-w-[220px]"
            />
          </div>
        </ProgressoCard>

        <ProgressoCard
          icon={<BarChart3 className="size-4" />}
          title="Distribuição"
          className="md:col-span-2"
          footer={
            <Link
              href="/progresso/detalhes"
              className="flex w-full items-center justify-center rounded-full border border-[var(--osmo-border)] py-2.5 text-sm text-osmo-muted transition hover:border-[color-mix(in_srgb,var(--osmo-text)_20%,transparent)] hover:text-osmo"
            >
              Ver análise completa
            </Link>
          }
        >
          <p className="text-[10px] uppercase tracking-wide text-osmo-subtle">
            Total de questões
          </p>
          <p className="mt-0.5 text-2xl font-medium tabular-nums text-osmo sm:mt-1 sm:text-3xl">
            {totalQuestoes}
          </p>
          <div className="mt-4 sm:mt-5">
            <ProgressoSegmentedBar
              segmentos={segmentos}
              total={totalQuestoes}
            />
          </div>
        </ProgressoCard>

        <section
          className={cn(
            "osmo-surface-dark overflow-hidden rounded-2xl border p-4 sm:rounded-[20px] sm:p-5 md:col-span-2",
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
            <div className="mb-2 flex items-center gap-2 sm:mb-3">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/55 sm:text-[10px]">
                Próximo passo · {lacunaPrincipal.label}
              </span>
            </div>
          ) : (
            <p className="text-[9px] uppercase tracking-[0.14em] text-white/35 sm:text-[10px]">
              Próximo passo
            </p>
          )}

          <p className="text-sm font-medium leading-snug text-white sm:text-base">
            {labelTreino}
          </p>

          <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Link
                href={hrefSimuladoFocado}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-osmo-accent px-5 py-2.5 text-sm font-medium transition hover:opacity-90 sm:w-auto"
              >
                Começar
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
                  {abrindoTutor ? "Abrindo…" : "Tutor IA"}
                </button>
              ) : null}
            </div>

            {proximaTrilha ? (
              <Link
                href={proximaTrilha.href}
                className="inline-flex items-center gap-1 text-sm text-white/45 transition hover:text-white/70"
              >
                {proximaTrilha.titulo}
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/trilha"
                className="inline-flex items-center gap-1 text-sm text-white/45 transition hover:text-white/70"
              >
                Continuar trilha
                <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        </section>

        <ProgressoCard
          icon={<BarChart3 className="size-4" />}
          title="Por área"
          className="md:col-span-1"
          footer={
            <Link
              href="/trilha"
              className="text-xs text-osmo-subtle transition hover:text-osmo-muted"
            >
              Trilha completa →
            </Link>
          }
        >
          <ProgressoAreasList
            areas={areasOrdenadas}
            lacunaSlug={lacunaPrincipal?.slug ?? null}
            tendencias={tendenciasArea}
          />
        </ProgressoCard>

        <ProgressoRadarChart areas={proficiencia.areas} />

        {cobertura?.anos?.length ? (
          <ProgressoCard
            icon={<Target className="size-4" />}
            title="Provas ENEM"
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
            <ProgressoEnemAnos anos={cobertura.anos} />
          </ProgressoCard>
        ) : null}

        {temGraficoEvolucao ? (
          <ProgressoCard
            icon={<TrendingUp className="size-4" />}
            title="Evolução"
            className="md:col-span-2"
            footer={
              <Link
                href="/progresso/detalhes"
                className="text-xs text-osmo-subtle transition hover:text-osmo-muted"
              >
                Histórico completo →
              </Link>
            }
          >
            <ProgressoEvolucaoChart
              pontos={evolucao}
              variant="line"
              compact
            />
          </ProgressoCard>
        ) : null}

        <ProgressoCard
          icon={<Target className="size-4" />}
          title="Meta da semana"
          className="md:col-span-2"
        >
          <p className="text-[13px] leading-relaxed text-osmo-muted sm:text-sm">
            {lacunas.metaSemanal}
          </p>
          {trilha?.metaEnem ? (
            <p className="mt-2.5 text-[13px] text-osmo-subtle sm:mt-3 sm:text-sm">
              <span className="text-osmo-accent">Objetivo ENEM:</span>{" "}
              {trilha.metaEnem}
            </p>
          ) : null}
          {proficiencia.ultimoSimulado ? (
            <p className="mt-3 border-t border-[var(--osmo-border)] pt-3 text-[11px] text-osmo-subtle sm:mt-4 sm:pt-4 sm:text-xs">
              <Link
                href={`/simulados/${proficiencia.ultimoSimulado.id}/resultado`}
                className="underline-offset-2 hover:text-osmo-muted hover:underline"
              >
                Último simulado: {proficiencia.ultimoSimulado.acertos}/
                {proficiencia.ultimoSimulado.totalQuestoes} ·{" "}
                {proficiencia.ultimoSimulado.percentual}%
              </Link>
            </p>
          ) : null}
        </ProgressoCard>
      </div>
    </div>
  );
}

/** Visão detalhada — evolução, lista completa e histórico. */
export function ProgressoDetalheView({
  proficiencia,
  evolucao,
  lacunas,
  trilha,
  cobertura,
}: ProgressoDataProps) {
  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const tendenciasArea = calcularTendenciasPorArea(evolucao);
  const areasOrdenadas = ordenarAreasPorPrioridade(
    proficiencia.areas,
    lacunas.lacunas,
  );
  const segmentos = montarSegmentosPorArea(proficiencia.areas);
  const totalQuestoes = proficiencia.resumo.questoesRespondidas;
  const semDados = proficiencia.resumo.simuladosConcluidos === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/progresso"
        className="inline-flex items-center gap-2 text-sm text-osmo-muted transition hover:text-osmo"
      >
        <ArrowLeft className="size-4" />
        Voltar ao resumo
      </Link>

      <header className="space-y-2 px-1">
        <h2 className="text-2xl font-medium tracking-tight text-osmo">
          Análise completa
        </h2>
        <p className="text-sm text-osmo-muted">
          {proficiencia.resumo.simuladosConcluidos} simulados ·{" "}
          {proficiencia.resumo.questoesRespondidas} questões respondidas
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {!semDados ? (
          <ProgressoCard
            icon={<TrendingUp className="size-4" />}
            title="Evolução"
            className="md:col-span-2"
          >
            <ProgressoEvolucaoChart pontos={evolucao} variant="line" />
          </ProgressoCard>
        ) : null}

        <ProgressoCard
          icon={<BarChart3 className="size-4" />}
          title="Distribuição por área"
          className="md:col-span-2"
        >
          <p className="mb-4 text-2xl font-medium text-osmo">
            {totalQuestoes}{" "}
            <span className="text-base font-normal text-osmo-subtle">questões</span>
          </p>
          <ProgressoSegmentedBar segmentos={segmentos} total={totalQuestoes} />
        </ProgressoCard>

        <ProgressoCard
          icon={<BarChart3 className="size-4" />}
          title="Por área"
          className="md:col-span-1"
        >
          <ProgressoAreasList
            areas={areasOrdenadas}
            lacunaSlug={lacunaPrincipal?.slug ?? null}
            tendencias={tendenciasArea}
          />
        </ProgressoCard>

        <ProgressoRadarChart areas={proficiencia.areas} />

        {cobertura?.anos?.length ? (
          <ProgressoCard
            icon={<Target className="size-4" />}
            title="Provas ENEM por ano"
            className="md:col-span-2"
          >
            <ProgressoEnemAnos anos={cobertura.anos} />
          </ProgressoCard>
        ) : null}

        <ProgressoCard
          icon={<Target className="size-4" />}
          title="Meta da semana"
          className="md:col-span-2"
        >
          <p className="text-[13px] leading-relaxed text-osmo-muted sm:text-sm">
            {lacunas.metaSemanal}
          </p>
          {trilha?.metaEnem ? (
            <p className="mt-2.5 text-[13px] text-osmo-subtle sm:mt-3 sm:text-sm">
              <span className="text-osmo-accent">Objetivo ENEM:</span>{" "}
              {trilha.metaEnem}
            </p>
          ) : null}
        </ProgressoCard>
      </div>

      {proficiencia.ultimoSimulado ? (
        <p className="text-center text-xs text-osmo-subtle">
          <Link
            href={`/simulados/${proficiencia.ultimoSimulado.id}/resultado`}
            className={cn(
              "underline-offset-2 hover:text-osmo-muted hover:underline",
            )}
          >
            Ver resultado do último simulado (
            {proficiencia.ultimoSimulado.acertos}/
            {proficiencia.ultimoSimulado.totalQuestoes} ·{" "}
            {proficiencia.ultimoSimulado.percentual}%)
          </Link>
        </p>
      ) : null}
    </div>
  );
}
