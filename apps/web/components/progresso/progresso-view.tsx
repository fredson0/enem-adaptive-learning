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
import { ArrowRight, ChevronRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

type ProgressoViewProps = {
  proficiencia: ProficienciaResponse;
  evolucao: PontoEvolucao[];
  lacunas: LacunasResponse;
  trilha: TrilhaResponse | null;
};

function TendenciaBadge({ valor }: { valor: number | null }) {
  if (valor === null) {
    return <span className="text-[11px] text-white/25">—</span>;
  }

  if (valor > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#b0ff57]">
        <TrendingUp className="size-3" />+{valor}%
      </span>
    );
  }

  if (valor < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-red-400/90">
        <TrendingDown className="size-3" />
        {valor}%
      </span>
    );
  }

  return <span className="text-[11px] text-white/35">0%</span>;
}

export function ProgressoView({
  proficiencia,
  evolucao,
  lacunas,
  trilha,
}: ProgressoViewProps) {
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
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Hero */}
      <section className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
            {titulo}
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/45">
            {subtitulo}
          </p>
        </div>

        {!semDados ? (
          <ProgressArcGauge
            percent={mediaExibida}
            labelLeft={`${mediaExibida}%`}
            labelRight="Média geral"
            className="max-w-[240px]"
          />
        ) : null}

        <p className="text-xs text-white/30">
          {proficiencia.resumo.simuladosConcluidos} simulados ·{" "}
          {proficiencia.resumo.questoesRespondidas} questões respondidas
          {proficiencia.ultimoSimulado?.finalizadoEm ? (
            <>
              {" "}
              · último: {proficiencia.ultimoSimulado.acertos}/
              {proficiencia.ultimoSimulado.totalQuestoes} (
              {proficiencia.ultimoSimulado.percentual}%)
            </>
          ) : null}
        </p>
      </section>

      {/* Ação imediata */}
      <section className="rounded-[16px] border border-[#5b4dff]/25 bg-[#5b4dff]/10 p-6">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#a89bff]">
          <Sparkles className="size-3.5" />
          O que fazer agora
        </p>

        {semDados ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-white/70">
              Comece com um treino rápido de 5 questões — em poucos minutos você
              já vê onde está forte e onde precisa reforçar.
            </p>
            <Link
              href="/simulados/treino/novo?quantidade=5"
              className="inline-flex items-center gap-2 rounded-full bg-[#b0ff57] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#c4ff7a]"
            >
              Começar treino
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-white/75">
              {lacunas.metaSemanal}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={hrefSimuladoFocado}
                className="inline-flex items-center gap-2 rounded-full bg-[#5b4dff] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6559ff]"
              >
                Treino em {lacunaPrincipal?.label ?? "foco"}
                <ArrowRight className="size-4" />
              </Link>
              {proximaTrilha ? (
                <Link
                  href={proximaTrilha.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
                >
                  {proximaTrilha.titulo}
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/trilha"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
                >
                  Ver minha trilha
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Mapa das 4 áreas */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-lg font-medium text-white">Por área</h3>
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

      {/* Evolução */}
      {!semDados ? (
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white">Evolução</h3>
          <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6">
            <ProgressoEvolucaoChart pontos={evolucao} />
          </div>
        </section>
      ) : null}

      {proficiencia.ultimoSimulado ? (
        <p className="text-center text-xs text-white/30">
          <Link
            href={`/simulados/${proficiencia.ultimoSimulado.id}/resultado`}
            className={cn("underline-offset-2 hover:text-white/50 hover:underline")}
          >
            Ver resultado do último simulado
          </Link>
        </p>
      ) : null}
    </div>
  );
}
