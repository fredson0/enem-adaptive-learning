"use client";

import { ProgressArcGauge } from "@/components/progresso/progress-arc-gauge";
import { ProgressoAreasList } from "@/components/progresso/progresso-areas-list";
import { ProgressoCard } from "@/components/progresso/progresso-card";
import { ProgressoComparativoSemana } from "@/components/progresso/progresso-comparativo-semana";
import { ProgressoCoberturaAreas } from "@/components/progresso/progresso-cobertura-areas";
import { ProgressoEvolucaoChart } from "@/components/progresso/progresso-evolucao-chart";
import { ProgressoHistoricoRecente } from "@/components/progresso/progresso-historico-recente";
import { ProgressoKpiStrip } from "@/components/progresso/progresso-kpi-strip";
import { ProgressoRadarChart } from "@/components/progresso/progresso-radar-chart";
import { ProgressoSectionShell } from "@/components/progresso/progresso-section-shell";
import { ProgressoSegmentedBar } from "@/components/progresso/progresso-segmented-bar";
import type { ProgressoDataProps } from "@/components/progresso/progresso-view";
import {
  calcularComparativoSemanal,
  calcularTendenciaGeral,
  calcularTendenciasPorArea,
  formatarLinhaTendencia,
  montarSegmentosPorArea,
  ordenarAreasPorPrioridade,
} from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { BarChart3, History, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

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

export function ProgressoDesempenhoView({
  proficiencia,
  evolucao,
  lacunas,
  cobertura,
}: ProgressoDataProps) {
  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const tendenciaGeral = calcularTendenciaGeral(evolucao);
  const tendenciasArea = calcularTendenciasPorArea(evolucao);
  const comparativoSemanal = calcularComparativoSemanal(evolucao);
  const mediaExibida = proficiencia.resumo.mediaGeralPercentual ?? 0;
  const areasOrdenadas = ordenarAreasPorPrioridade(
    proficiencia.areas,
    lacunas.lacunas,
  );
  const segmentos = montarSegmentosPorArea(proficiencia.areas);
  const totalQuestoes = proficiencia.resumo.questoesRespondidas;
  const linhaTendencia = formatarLinhaTendencia(
    tendenciaGeral,
    proficiencia.resumo.simuladosConcluidos,
  );

  const melhorArea = [...proficiencia.areas]
    .filter((a) => a.totalQuestoes > 0)
    .sort((a, b) => b.score - a.score)[0];

  const piorArea = lacunaPrincipal
    ? proficiencia.areas.find((a) => a.slug === lacunaPrincipal.slug)
    : [...proficiencia.areas]
        .filter((a) => a.totalQuestoes > 0)
        .sort((a, b) => a.score - b.score)[0];

  return (
    <ProgressoSectionShell
      title="Desempenho"
      description="Veja sua média geral, como cada área do ENEM está evoluindo e onde concentrar revisão."
    >
      <div className="space-y-3 md:space-y-4">
        <ProgressoKpiStrip
          items={[
            {
              label: "Simulados",
              value: String(proficiencia.resumo.simuladosConcluidos),
              hint: "concluídos no total",
            },
            {
              label: "Questões",
              value: String(totalQuestoes),
              hint: "respondidas",
            },
            {
              label: "Melhor área",
              value: melhorArea ? `${melhorArea.score}%` : "—",
              hint: melhorArea?.label ?? "Sem dados",
              accent: "positive",
            },
            {
              label: "Precisa atenção",
              value: piorArea ? `${piorArea.score}%` : "—",
              hint: piorArea?.label ?? "Sem lacunas",
              accent: "warning",
            },
          ]}
        />

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <ProgressoCard
            icon={<TrendingUp className="size-4" />}
            title="Média geral"
            footer={
              linhaTendencia ? (
                <LinhaTendencia texto={linhaTendencia} />
              ) : undefined
            }
          >
            <div className="flex justify-center py-1">
              <ProgressArcGauge
                percent={mediaExibida}
                labelLeft={`${mediaExibida}%`}
                labelRight="média geral"
                className="max-w-[200px] sm:max-w-[220px]"
              />
            </div>
            {proficiencia.ultimoSimulado ? (
              <p className="mt-3 text-center text-[11px] text-osmo-subtle">
                Último:{" "}
                <Link
                  href={`/simulados/${proficiencia.ultimoSimulado.id}/resultado`}
                  className="text-osmo-muted underline-offset-2 hover:underline"
                >
                  {proficiencia.ultimoSimulado.percentual}% ·{" "}
                  {proficiencia.ultimoSimulado.acertos}/
                  {proficiencia.ultimoSimulado.totalQuestoes}
                </Link>
              </p>
            ) : null}
          </ProgressoCard>

          <ProgressoCard
            icon={<BarChart3 className="size-4" />}
            title="Distribuição por área"
          >
            <p className="text-[10px] uppercase tracking-wide text-osmo-subtle">
              Volume de questões
            </p>
            <p className="mt-0.5 text-2xl font-medium tabular-nums text-osmo sm:text-3xl">
              {totalQuestoes}
            </p>
            <div className="mt-4 sm:mt-5">
              <ProgressoSegmentedBar
                segmentos={segmentos}
                total={totalQuestoes}
              />
            </div>
          </ProgressoCard>

          <ProgressoCard
            icon={<TrendingUp className="size-4" />}
            title="Esta semana vs anterior"
            className="md:col-span-2"
          >
            <ProgressoComparativoSemana comparativo={comparativoSemanal} />
          </ProgressoCard>

          <ProgressoCard
            icon={<BarChart3 className="size-4" />}
            title="Por área"
            footer={
              lacunaPrincipal ? (
                <Link
                  href="/progresso/foco"
                  className="text-xs text-osmo-subtle transition hover:text-osmo-muted"
                >
                  Ver plano de foco →
                </Link>
              ) : undefined
            }
          >
            <ProgressoAreasList
              areas={areasOrdenadas}
              lacunaSlug={lacunaPrincipal?.slug ?? null}
              tendencias={tendenciasArea}
            />
          </ProgressoCard>

          <ProgressoRadarChart areas={proficiencia.areas} />

          <ProgressoCard
            icon={<TrendingUp className="size-4" />}
            title="Evolução nos simulados"
            className="md:col-span-2"
          >
            <ProgressoEvolucaoChart pontos={evolucao} variant="line" />
          </ProgressoCard>

          {cobertura?.areas?.length ? (
            <ProgressoCard
              icon={<Target className="size-4" />}
              title="Cobertura do banco por área"
              className="md:col-span-2"
              footer={
                <Link
                  href="/progresso/foco"
                  className="text-xs text-osmo-subtle transition hover:text-osmo-muted"
                >
                  Ver assuntos e provas ENEM →
                </Link>
              }
            >
              <ProgressoCoberturaAreas areas={cobertura.areas} />
            </ProgressoCard>
          ) : null}

          <ProgressoCard
            icon={<History className="size-4" />}
            title="Histórico recente"
            className="md:col-span-2"
          >
            <ProgressoHistoricoRecente pontos={evolucao} limit={6} />
          </ProgressoCard>
        </div>
      </div>
    </ProgressoSectionShell>
  );
}
