"use client";

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
  formatarLinhaTendencia,
  montarSubtituloProgresso,
  obterProximaAcaoTrilha,
  ordenarAreasPorPrioridade,
} from "@/lib/progresso-helpers";
import type { TrilhaResponse } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
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

function LinhaTendencia({ texto }: { texto: string }) {
  const positivo = texto.startsWith("+");
  const negativo = texto.startsWith("-");

  return (
    <p
      className={cn(
        "text-sm",
        positivo && "text-[#b0ff57]/90",
        negativo && "text-red-400/85",
        !positivo && !negativo && "text-white/40",
      )}
    >
      {texto}
    </p>
  );
}

/** Home — resumo, próximo passo e mapa mínimo das áreas. */
export function ProgressoView({
  proficiencia,
  evolucao,
  lacunas,
  trilha,
}: ProgressoDataProps) {
  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const tendenciaGeral = calcularTendenciaGeral(evolucao);
  const mediaExibida = proficiencia.resumo.mediaGeralPercentual ?? 0;
  const areasOrdenadas = ordenarAreasPorPrioridade(
    proficiencia.areas,
    lacunas.lacunas,
  );
  const proximaTrilha = obterProximaAcaoTrilha(trilha);
  const semDados = proficiencia.resumo.simuladosConcluidos === 0;

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

  if (semDados) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 py-4 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">
            Progresso
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
            Comece hoje
          </h2>
          <p className="text-sm leading-relaxed text-white/45">
            5 questões bastam para ver seu mapa de proficiência por área.
          </p>
        </div>

        <Link
          href="/simulados/treino/novo?quantidade=5"
          className="inline-flex items-center gap-2 rounded-full bg-[#b0ff57] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#c4ff7a]"
        >
          Fazer primeiro treino
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 py-2">
      <header className="space-y-2 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.18em] text-white/30">
          Progresso
        </p>
        <motion.p
          key={mediaExibida}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-medium tabular-nums tracking-tight text-white md:text-6xl"
        >
          {mediaExibida}%
        </motion.p>
        {linhaTendencia ? <LinhaTendencia texto={linhaTendencia} /> : null}
        <p className="text-sm text-white/45">{subtitulo}</p>
      </header>

      <section className="rounded-[16px] border border-white/[0.08] bg-[#161616] p-5">
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
          Próximo passo
        </p>
        <p className="mt-2 text-base font-medium text-white">{labelTreino}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={hrefSimuladoFocado}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b0ff57] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#c4ff7a]"
          >
            Começar
            <ArrowRight className="size-4" />
          </Link>

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

      <section className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
          Por área
        </p>
        <ul className="space-y-2">
          {areasOrdenadas.map((area, index) => {
            const cor = AREA_CORES[area.slug] ?? "#ffffff";
            const ehPrioridade = lacunaPrincipal?.slug === area.slug;
            const semPratica = area.totalQuestoes === 0;
            const score = semPratica ? 0 : area.score;

            return (
              <li key={area.area}>
                <Link
                  href={`/trilha/${area.slug}`}
                  className={cn(
                    "flex items-center gap-3 rounded-[12px] px-3.5 py-3 transition",
                    ehPrioridade
                      ? "bg-white/[0.06] ring-1 ring-white/10"
                      : "hover:bg-white/[0.04]",
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm",
                          ehPrioridade
                            ? "font-medium text-white"
                            : "text-white/75",
                        )}
                      >
                        {area.label}
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-white/80">
                        {semPratica ? "—" : `${area.score}%`}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          backgroundColor: cor,
                          opacity: ehPrioridade ? 1 : 0.75,
                        }}
                      />
                    </div>
                  </div>
                  {ehPrioridade && index === 0 ? (
                    <span className="hidden shrink-0 text-[9px] uppercase tracking-wide text-white/30 sm:inline">
                      Foco
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-center pt-1">
        <Link
          href="/progresso/detalhes"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 transition hover:text-white/70"
        >
          Análise completa
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
          {proficiencia.resumo.simuladosConcluidos} simulados ·{" "}
          {proficiencia.resumo.questoesRespondidas} questões respondidas
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
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/55">
                          Foco
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
