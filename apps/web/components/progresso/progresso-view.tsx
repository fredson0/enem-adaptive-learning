"use client";

import { ProgressArcGauge } from "@/components/progresso/progress-arc-gauge";
import { ProgressoEvolucaoChart } from "@/components/progresso/progresso-evolucao-chart";
import type {
  LacunasResponse,
  ProficienciaResponse,
  PontoEvolucao,
} from "@/lib/metricas";
import {
  AREA_CORES,
  calcularTendenciaGeral,
  calcularTendenciasPorArea,
  montarTituloHero,
  obterProximaAcaoTrilha,
  ordenarAreasPorPrioridade,
} from "@/lib/progresso-helpers";
import type { TrilhaResponse } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export type ProgressoDataProps = {
  proficiencia: ProficienciaResponse;
  evolucao: PontoEvolucao[];
  lacunas: LacunasResponse;
  trilha: TrilhaResponse | null;
};

function TendenciaBadge({ valor }: { valor: number | null }) {
  if (valor === null) {
    return <span className="text-[10px] text-white/25">—</span>;
  }

  if (valor > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#b0ff57]">
        <TrendingUp className="size-2.5" />+{valor}%
      </span>
    );
  }

  if (valor < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-400/90">
        <TrendingDown className="size-2.5" />
        {valor}%
      </span>
    );
  }

  return <span className="text-[10px] text-white/35">0%</span>;
}

/** Visão compacta — cabe na tela sem scroll. */
export function ProgressoView({
  proficiencia,
  evolucao,
  lacunas,
  trilha,
}: ProgressoDataProps) {
  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const tendenciaGeral = calcularTendenciaGeral(evolucao);
  const tendenciasArea = calcularTendenciasPorArea(evolucao);
  const { titulo, subtitulo } = montarTituloHero({
    simuladosConcluidos: proficiencia.resumo.simuladosConcluidos,
    mediaGeral: proficiencia.resumo.mediaGeralPercentual,
    tendenciaGeral,
    lacunaPrincipal,
  });

  const mediaExibida = proficiencia.resumo.mediaGeralPercentual ?? 0;
  const areasOrdenadas = ordenarAreasPorPrioridade(
    proficiencia.areas,
    lacunas.lacunas,
  );
  const proximaTrilha = obterProximaAcaoTrilha(trilha);
  const semDados = proficiencia.resumo.simuladosConcluidos === 0;

  const hrefSimuladoFocado = lacunaPrincipal
    ? `/simulados/treino/novo?area=${lacunaPrincipal.simuladoSugerido.area}&quantidade=${lacunaPrincipal.simuladoSugerido.quantidade}`
    : "/simulados/treino/novo?quantidade=5";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col justify-center gap-5 py-2 md:gap-6">
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,200px)_1fr] md:gap-8">
        {!semDados ? (
          <ProgressArcGauge
            percent={mediaExibida}
            labelLeft={`${mediaExibida}%`}
            labelRight="Média geral"
            className="mx-auto w-full max-w-[180px] md:mx-0"
          />
        ) : (
          <div className="mx-auto flex size-[140px] items-center justify-center rounded-full border border-dashed border-white/15 bg-white/[0.02] md:mx-0">
            <span className="text-center text-xs text-white/35">
              Sem dados
              <br />
              ainda
            </span>
          </div>
        )}

        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl font-medium tracking-tight text-white md:text-2xl">
            {titulo}
          </h2>
          <p className="text-sm leading-relaxed text-white/45">{subtitulo}</p>
          <p className="text-[11px] text-white/30">
            {proficiencia.resumo.simuladosConcluidos} simulados ·{" "}
            {proficiencia.resumo.questoesRespondidas} questões
          </p>
        </div>
      </div>

      <section className="rounded-[14px] border border-[#5b4dff]/25 bg-[#5b4dff]/10 px-4 py-3.5 md:px-5">
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#a89bff]">
          <Sparkles className="size-3" />
          O que fazer agora
        </p>

        {semDados ? (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/70">
              Comece com um treino de 5 questões.
            </p>
            <Link
              href="/simulados/treino/novo?quantidade=5"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#b0ff57] px-4 py-2 text-xs font-medium text-black transition hover:bg-[#c4ff7a]"
            >
              Começar
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Link
              href={hrefSimuladoFocado}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#5b4dff] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#6559ff]"
            >
              Treino · {lacunaPrincipal?.label ?? "foco"}
              <ArrowRight className="size-3.5" />
            </Link>
            {proximaTrilha ? (
              <Link
                href={proximaTrilha.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-white/75 transition hover:border-white/25 hover:text-white"
              >
                {proximaTrilha.titulo}
                <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <Link
                href="/trilha"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-white/75 transition hover:border-white/25 hover:text-white"
              >
                Ver trilha
                <ChevronRight className="size-3.5" />
              </Link>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {areasOrdenadas.map((area) => {
          const cor = AREA_CORES[area.slug] ?? "#ffffff";
          const tendencia = tendenciasArea.get(area.slug) ?? null;
          const ehPrioridade = lacunaPrincipal?.slug === area.slug;
          const semPratica = area.totalQuestoes === 0;

          return (
            <Link
              key={area.area}
              href={`/trilha/${area.slug}`}
              className="rounded-[12px] border border-white/[0.06] bg-[#161616] p-3.5 transition hover:border-white/12 hover:bg-[#1a1a1a]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white">
                  {area.label}
                </span>
                <span className="text-sm font-medium text-white">
                  {semPratica ? "—" : `${area.score}%`}
                </span>
              </div>

              {ehPrioridade ? (
                <span className="mt-1 inline-block rounded-full bg-[#5b4dff]/20 px-1.5 py-0.5 text-[9px] font-medium text-[#c4bbff]">
                  Prioridade
                </span>
              ) : null}

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${area.score}%`, backgroundColor: cor }}
                />
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-[10px] text-white/35">
                  {semPratica
                    ? "Sem prática"
                    : `${area.acertos}/${area.totalQuestoes}`}
                </span>
                <TendenciaBadge valor={tendencia} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center pt-1">
        <Link
          href="/progresso/detalhes"
          className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/75"
        >
          Ver análise completa
          <ArrowRight className="size-3.5" />
        </Link>
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
}: ProgressoDataProps) {
  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const tendenciasArea = calcularTendenciasPorArea(evolucao);
  const areasOrdenadas = ordenarAreasPorPrioridade(
    proficiencia.areas,
    lacunas.lacunas,
  );
  const semDados = proficiencia.resumo.simuladosConcluidos === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/progresso"
        className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white/75"
      >
        <ArrowLeft className="size-4" />
        Voltar ao resumo
      </Link>

      <header className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Análise completa
        </h2>
        <p className="text-sm text-white/45">
          Evolução nos simulados, detalhes por área e metas da semana.
        </p>
      </header>

      {!semDados ? (
        <section className="space-y-3">
          <h3 className="text-base font-medium text-white">Evolução</h3>
          <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
            <ProgressoEvolucaoChart pontos={evolucao} />
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-base font-medium text-white">Por área</h3>
          <Link
            href="/trilha"
            className="text-xs text-white/40 transition hover:text-white/65"
          >
            Trilha completa →
          </Link>
        </div>

        <ul className="divide-y divide-white/[0.06] rounded-[14px] border border-white/[0.06] bg-[#161616]">
          {areasOrdenadas.map((area) => {
            const cor = AREA_CORES[area.slug] ?? "#ffffff";
            const tendencia = tendenciasArea.get(area.slug) ?? null;
            const ehPrioridade = lacunaPrincipal?.slug === area.slug;
            const semPratica = area.totalQuestoes === 0;

            return (
              <li key={area.area}>
                <Link
                  href={`/trilha/${area.slug}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {area.label}
                      </span>
                      {ehPrioridade ? (
                        <span className="rounded-full bg-[#5b4dff]/20 px-2 py-0.5 text-[10px] font-medium text-[#c4bbff]">
                          Prioridade
                        </span>
                      ) : null}
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${area.score}%`,
                          backgroundColor: cor,
                        }}
                      />
                    </div>

                    <p className="text-[11px] text-white/35">
                      {semPratica
                        ? "Sem prática ainda"
                        : `${area.acertos}/${area.totalQuestoes} acertos`}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-lg font-medium text-white">
                      {semPratica ? "—" : `${area.score}%`}
                    </span>
                    <TendenciaBadge valor={tendencia} />
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-white/20" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
        <p className="text-xs uppercase tracking-wide text-white/35">
          Meta da semana
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          {lacunas.metaSemanal}
        </p>
        {trilha?.metaEnem ? (
          <p className="mt-3 text-sm text-white/45">
            <span className="text-[#b0ff57]">Objetivo ENEM:</span>{" "}
            {trilha.metaEnem}
          </p>
        ) : null}
      </section>

      {proficiencia.ultimoSimulado ? (
        <p className="text-center text-xs text-white/30">
          <Link
            href={`/simulados/${proficiencia.ultimoSimulado.id}/resultado`}
            className={cn(
              "underline-offset-2 hover:text-white/50 hover:underline",
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
