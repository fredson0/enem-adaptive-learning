"use client";

import { ProgressoAreasList } from "@/components/progresso/progresso-areas-list";
import { ProgressoBlock } from "@/components/progresso/progresso-block";
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
import { ArrowRight } from "lucide-react";
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
      tone="desempenho"
      title="Desempenho"
      description="Veja sua média geral, como cada área do ENEM está evoluindo e onde concentrar revisão."
    >
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

      <div className="grid gap-10 border-t border-[var(--osmo-border)] pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-12">
        <ProgressoBlock eyebrow="Média geral" className="lg:col-span-5">
          <p className="text-6xl font-medium tabular-nums tracking-tight text-osmo sm:text-7xl">
            {mediaExibida}%
          </p>
          {linhaTendencia ? (
            <div className="mt-3">
              <LinhaTendencia texto={linhaTendencia} />
            </div>
          ) : null}
          {proficiencia.ultimoSimulado ? (
            <p className="mt-4 text-sm text-osmo-subtle">
              Último simulado{" "}
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
        </ProgressoBlock>

        <ProgressoBlock eyebrow="Volume por área" className="lg:col-span-7">
          <p className="text-sm text-osmo-muted">Questões respondidas</p>
          <p className="mt-1 text-3xl font-medium tabular-nums tracking-tight text-osmo sm:text-4xl">
            {totalQuestoes}
          </p>
          <div className="mt-6">
            <ProgressoSegmentedBar
              segmentos={segmentos}
              total={totalQuestoes}
            />
          </div>
        </ProgressoBlock>
      </div>

      <ProgressoBlock
        eyebrow="Esta semana vs anterior"
        className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
      >
        <ProgressoComparativoSemana comparativo={comparativoSemanal} />
      </ProgressoBlock>

      <div className="grid gap-10 border-t border-[var(--osmo-border)] pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-12">
        <ProgressoBlock
          eyebrow="Por área"
          className="lg:col-span-7"
          action={
            lacunaPrincipal ? (
              <Link
                href="/progresso/foco"
                className="inline-flex items-center gap-1 text-xs text-osmo-subtle transition hover:text-osmo"
              >
                Plano de foco
                <ArrowRight className="size-3.5" />
              </Link>
            ) : undefined
          }
        >
          <ProgressoAreasList
            areas={areasOrdenadas}
            lacunaSlug={lacunaPrincipal?.slug ?? null}
            tendencias={tendenciasArea}
          />
        </ProgressoBlock>

        <ProgressoBlock eyebrow="Mapa ENEM" className="lg:col-span-5">
          <ProgressoRadarChart areas={proficiencia.areas} />
        </ProgressoBlock>
      </div>

      <ProgressoBlock
        eyebrow="Evolução nos simulados"
        className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
      >
        <ProgressoEvolucaoChart pontos={evolucao} variant="line" />
      </ProgressoBlock>

      {cobertura?.areas?.length ? (
        <ProgressoBlock
          eyebrow="Cobertura do banco"
          className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
          action={
            <Link
              href="/progresso/foco"
              className="inline-flex items-center gap-1 text-xs text-osmo-subtle transition hover:text-osmo"
            >
              Assuntos e provas
              <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <ProgressoCoberturaAreas areas={cobertura.areas} />
        </ProgressoBlock>
      ) : null}

      <ProgressoBlock
        eyebrow="Histórico recente"
        className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
      >
        <ProgressoHistoricoRecente pontos={evolucao} limit={6} />
      </ProgressoBlock>
    </ProgressoSectionShell>
  );
}
