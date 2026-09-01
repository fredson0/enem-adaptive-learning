"use client";

import { ProgressoCard } from "@/components/progresso/progresso-card";
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
import {
  BarChart3,
  CalendarCheck,
  Check,
  History,
  Target,
  TrendingUp,
} from "lucide-react";
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
      title="Rotina"
      description="Acompanhe sua consistência de estudo, compare semanas e mantenha o ritmo até o ENEM."
    >
      <div className="space-y-3 md:space-y-4">
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
                totalChecklist > 0
                  ? `${diasCompletos}/${totalChecklist}`
                  : "—",
              hint: "metas da semana",
            },
          ]}
        />

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <ProgressoStreakCard ritmo={ritmoSemanal} />

          <ProgressoCard
            icon={<CalendarCheck className="size-4" />}
            title="Meta da semana"
          >
            {trilha?.planoIa?.proximoPasso ? (
              <div className="mb-3 rounded-xl border border-[color-mix(in_srgb,var(--osmo-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--osmo-accent)_8%,transparent)] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-osmo-accent">
                  Hoje
                </p>
                <p className="mt-1 text-sm leading-relaxed text-osmo">
                  {trilha.planoIa.proximoPasso}
                </p>
              </div>
            ) : null}
            <p className="text-[13px] leading-relaxed text-osmo-muted sm:text-sm">
              {lacunas.metaSemanal}
            </p>
            {trilha?.metaEnem ? (
              <p className="mt-3 text-[13px] text-osmo-subtle sm:text-sm">
                <span className="text-osmo-accent">Objetivo ENEM:</span>{" "}
                {trilha.metaEnem}
              </p>
            ) : null}
            {trilha?.tempoDiarioMinutos ? (
              <p className="mt-2 text-[11px] text-osmo-subtle">
                Tempo diário sugerido: {trilha.tempoDiarioMinutos} min
              </p>
            ) : null}
            <Link
              href="/trilha/geral"
              className="mt-4 inline-flex rounded-full bg-osmo-accent px-4 py-2 text-xs font-medium transition hover:opacity-90"
            >
              {trilha?.planoIa ? "Ver plano completo" : "Gerar plano na trilha geral"}
            </Link>
          </ProgressoCard>

          {lacunas.checklist.length > 0 ? (
            <ProgressoCard
              icon={<Check className="size-4" />}
              title="Checklist da semana"
              className="md:col-span-2"
            >
              <ul className="space-y-2.5">
                {lacunas.checklist.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-start gap-2.5 text-sm",
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
                      {item.concluido ? (
                        <Check className="size-2.5" />
                      ) : null}
                    </span>
                    {item.texto}
                  </li>
                ))}
              </ul>
            </ProgressoCard>
          ) : null}

          <ProgressoCard
            icon={<TrendingUp className="size-4" />}
            title="Esta semana vs anterior"
            className="md:col-span-2"
          >
            <ProgressoComparativoSemana comparativo={comparativoSemanal} />
          </ProgressoCard>

          <ProgressoCard
            icon={<BarChart3 className="size-4" />}
            title="Linha do tempo (30 dias)"
            className="md:col-span-2"
          >
            <p className="mb-3 text-[11px] text-osmo-subtle">
              Cada barra mostra quantos simulados você fez naquele dia.
            </p>
            <ProgressoLinhaTempo dias={linhaTempo30Dias} />
          </ProgressoCard>

          <ProgressoCard
            icon={<Target className="size-4" />}
            title="Última atividade"
            className="md:col-span-2"
            footer={
              proficiencia.ultimoSimulado ? (
                <Link
                  href={`/simulados/${proficiencia.ultimoSimulado.id}/resultado`}
                  className="text-xs text-osmo-subtle transition hover:text-osmo-muted"
                >
                  Ver resultado completo →
                </Link>
              ) : undefined
            }
          >
            {proficiencia.ultimoSimulado ? (
              <div className="rounded-xl border border-[var(--osmo-border)] bg-[var(--osmo-hover)] p-4">
                <p className="truncate text-sm text-osmo">
                  {proficiencia.ultimoSimulado.label ?? "Último simulado"}
                </p>
                <p className="mt-2 text-2xl font-medium tabular-nums text-osmo">
                  {proficiencia.ultimoSimulado.percentual}%
                </p>
                <p className="mt-1 text-sm font-normal text-osmo-subtle">
                  {proficiencia.ultimoSimulado.acertos}/
                  {proficiencia.ultimoSimulado.totalQuestoes} acertos
                </p>
              </div>
            ) : (
              <p className="text-sm text-osmo-muted">
                Você ainda não finalizou um simulado.
              </p>
            )}
          </ProgressoCard>

          <ProgressoCard
            icon={<History className="size-4" />}
            title="Simulados recentes"
            className="md:col-span-2"
          >
            <ProgressoHistoricoRecente pontos={evolucao} limit={5} />
          </ProgressoCard>
        </div>
      </div>
    </ProgressoSectionShell>
  );
}
