"use client";

import { ProgressoBlock } from "@/components/progresso/progresso-block";
import { ProgressoComparativoSemana } from "@/components/progresso/progresso-comparativo-semana";
import { ProgressoHistoricoRecente } from "@/components/progresso/progresso-historico-recente";
import { ProgressoKpiStrip } from "@/components/progresso/progresso-kpi-strip";
import { ProgressoLinhaTempo } from "@/components/progresso/progresso-linha-tempo";
import { ProgressoSectionShell } from "@/components/progresso/progresso-section-shell";
import { ProgressoStreakCard } from "@/components/progresso/progresso-streak-card";
import type { ProgressoDataProps } from "@/components/progresso/progresso-view";
import {
  calcularComparativoSemanal,
  calcularRitmoSemanal,
  montarLinhaTempo30Dias,
} from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export function ProgressoRotinaView({
  proficiencia,
  evolucao,
  lacunas,
  trilha,
}: ProgressoDataProps) {
  const comparativoSemanal = calcularComparativoSemanal(evolucao);
  const linhaTempo30Dias = montarLinhaTempo30Dias(evolucao);
  const ritmoSemanal = calcularRitmoSemanal(evolucao);
  const diasCompletos = lacunas.checklist.filter((i) => i.concluido).length;
  const totalChecklist = lacunas.checklist.length;

  return (
    <ProgressoSectionShell
      tone="rotina"
      title="Rotina"
      description="Acompanhe sua consistência de estudo, compare semanas e mantenha o ritmo até o ENEM."
    >
      <ProgressoKpiStrip
        items={[
          {
            label: "Dias ativos",
            value: `${ritmoSemanal.diasAtivosNaSemana}/7`,
            hint: "nesta semana",
            accent:
              ritmoSemanal.diasAtivosNaSemana >= 4 ? "positive" : "default",
          },
          {
            label: "Sequência",
            value: String(ritmoSemanal.sequenciaAtual),
            hint:
              ritmoSemanal.sequenciaAtual === 1
                ? "dia seguido"
                : "dias seguidos",
          },
          {
            label: "Simulados",
            value: String(comparativoSemanal.simuladosSemanaAtual),
            hint: "feitos esta semana",
          },
          {
            label: "Checklist",
            value:
              totalChecklist > 0 ? `${diasCompletos}/${totalChecklist}` : "—",
            hint: "metas da semana",
          },
        ]}
      />

      <div className="grid gap-10 border-t border-[var(--osmo-border)] pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-12">
        <div className="lg:col-span-7">
          <ProgressoStreakCard ritmo={ritmoSemanal} />
        </div>

        <ProgressoBlock eyebrow="Meta da semana" className="lg:col-span-5">
          {trilha?.planoIa?.proximoPasso ? (
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-osmo-accent">
                Hoje
              </p>
              <p className="mt-2 text-lg leading-snug text-osmo sm:text-xl">
                {trilha.planoIa.proximoPasso}
              </p>
            </div>
          ) : null}
          <p
            className={cn(
              "text-sm leading-relaxed text-osmo-muted",
              trilha?.planoIa?.proximoPasso && "mt-5",
            )}
          >
            {lacunas.metaSemanal}
          </p>
          {trilha?.metaEnem ? (
            <p className="mt-4 text-sm text-osmo">
              <span className="text-osmo-subtle">Objetivo ENEM · </span>
              {trilha.metaEnem}
            </p>
          ) : null}
          {trilha?.tempoDiarioMinutos ? (
            <p className="mt-1 text-sm text-osmo-subtle">
              {trilha.tempoDiarioMinutos} min por dia
            </p>
          ) : null}
          <Link
            href="/trilha/geral"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-osmo-accent transition hover:underline"
          >
            {trilha?.planoIa ? "Ver plano completo" : "Gerar plano na trilha geral"}
            <ArrowRight className="size-4" />
          </Link>
        </ProgressoBlock>
      </div>

      {lacunas.checklist.length > 0 ? (
        <ProgressoBlock
          eyebrow="Checklist da semana"
          className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
        >
          <ul className="grid gap-x-12 gap-y-3 sm:grid-cols-2">
            {lacunas.checklist.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-start gap-3 text-sm leading-relaxed",
                  item.concluido
                    ? "text-osmo-subtle line-through"
                    : "text-osmo-muted",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    item.concluido
                      ? "border-osmo-accent/40 bg-osmo-accent/15 text-osmo-accent"
                      : "border-[var(--osmo-border)]",
                  )}
                >
                  {item.concluido ? <Check className="size-2.5" /> : null}
                </span>
                {item.texto}
              </li>
            ))}
          </ul>
        </ProgressoBlock>
      ) : null}

      <ProgressoBlock
        eyebrow="Esta semana vs anterior"
        className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
      >
        <ProgressoComparativoSemana comparativo={comparativoSemanal} />
      </ProgressoBlock>

      <ProgressoBlock
        eyebrow="Linha do tempo"
        className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
      >
        <p className="mb-5 text-sm text-osmo-muted">
          Cada barra mostra quantos simulados você fez naquele dia.
        </p>
        <ProgressoLinhaTempo dias={linhaTempo30Dias} />
      </ProgressoBlock>

      <div className="grid gap-10 border-t border-[var(--osmo-border)] pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-12">
        <ProgressoBlock eyebrow="Última atividade" className="lg:col-span-5">
          {proficiencia.ultimoSimulado ? (
            <>
              <p className="text-sm text-osmo-muted">
                {proficiencia.ultimoSimulado.label ?? "Último simulado"}
              </p>
              <p className="mt-2 text-5xl font-medium tabular-nums tracking-tight text-osmo sm:text-6xl">
                {proficiencia.ultimoSimulado.percentual}%
              </p>
              <p className="mt-2 text-sm text-osmo-subtle">
                {proficiencia.ultimoSimulado.acertos}/
                {proficiencia.ultimoSimulado.totalQuestoes} acertos
              </p>
              <Link
                href={`/simulados/${proficiencia.ultimoSimulado.id}/resultado`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm text-osmo-accent transition hover:underline"
              >
                Ver resultado completo
                <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <p className="text-sm text-osmo-muted">
              Você ainda não finalizou um simulado.
            </p>
          )}
        </ProgressoBlock>

        <ProgressoBlock eyebrow="Simulados recentes" className="lg:col-span-7">
          <ProgressoHistoricoRecente pontos={evolucao} limit={5} />
        </ProgressoBlock>
      </div>
    </ProgressoSectionShell>
  );
}
