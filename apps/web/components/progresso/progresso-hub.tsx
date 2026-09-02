"use client";

import { GlareCard } from "@/components/ui/glare-cards";
import type {
  CoberturaResponse,
  LacunasResponse,
  ProficienciaResponse,
  PontoEvolucao,
} from "@/lib/metricas";
import {
  AREA_SIGLAS,
  calcularRitmoSemanal,
  calcularTendenciaGeral,
  formatarLinhaTendencia,
  montarSubtituloProgresso,
} from "@/lib/progresso-helpers";
import { PROGRESSO_HUB_VISUAL } from "@/lib/progresso-hub-visual";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const HUB_CARDS = [
  {
    id: "desempenho" as const,
    href: "/progresso/desempenho",
    title: "Desempenho",
    subtitle: "Média, áreas e evolução",
    image: "/progresso/desempenho.png",
    imageAlt: "Gráfico de evolução do desempenho no ENEM+IA",
    icon: BarChart3,
    badgeClass:
      "text-[#3d5a18] dark:text-[#b0ff57] border-[#b0ff57]/30 bg-[#b0ff57]/12 dark:border-[#b0ff57]/25 dark:bg-[#b0ff57]/10",
    activeDayClass:
      "border-[#b0ff57]/35 bg-[#b0ff57]/15 text-[#3d5a18] dark:border-[#b0ff57]/40 dark:bg-[#b0ff57]/20 dark:text-[#b0ff57]",
  },
  {
    id: "rotina" as const,
    href: "/progresso/rotina",
    title: "Rotina",
    subtitle: "Ritmo, metas e consistência",
    image: "/progresso/rotina.png",
    imageAlt: "Painel da semana de estudo no ENEM+IA",
    icon: CalendarDays,
    badgeClass:
      "text-[#4a3db8] dark:text-[#7c6cff] border-[#7c6cff]/30 bg-[#7c6cff]/10 dark:border-[#7c6cff]/25 dark:bg-[#7c6cff]/10",
    activeDayClass:
      "border-[#7c6cff]/35 bg-[#7c6cff]/15 text-[#4a3db8] dark:border-[#7c6cff]/40 dark:bg-[#7c6cff]/20 dark:text-[#7c6cff]",
  },
  {
    id: "foco" as const,
    href: "/progresso/foco",
    title: "Foco agora",
    subtitle: "Lacunas e próximo passo",
    image: "/progresso/focoAgora.png",
    imageAlt: "Alvo do próximo passo e da principal lacuna no ENEM+IA",
    icon: Target,
    badgeClass:
      "text-[#1e3a8a] dark:text-[#60a5fa] border-[#60a5fa]/30 bg-[#60a5fa]/10 dark:border-[#60a5fa]/25 dark:bg-[#60a5fa]/10",
    activeDayClass:
      "border-[#60a5fa]/35 bg-[#60a5fa]/15 text-[#1e3a8a] dark:border-[#60a5fa]/40 dark:bg-[#60a5fa]/20 dark:text-[#60a5fa]",
  },
];

type ProgressoHubProps = {
  proficiencia: ProficienciaResponse;
  evolucao: PontoEvolucao[];
  lacunas: LacunasResponse;
  cobertura?: CoberturaResponse | null;
};

export function ProgressoHub({
  proficiencia,
  evolucao,
  lacunas,
  cobertura,
}: ProgressoHubProps) {
  const semDados = proficiencia.resumo.simuladosConcluidos === 0;
  const mediaExibida = proficiencia.resumo.mediaGeralPercentual ?? 0;
  const tendenciaGeral = calcularTendenciaGeral(evolucao);
  const linhaTendencia = formatarLinhaTendencia(
    tendenciaGeral,
    proficiencia.resumo.simuladosConcluidos,
  );
  const ritmo = calcularRitmoSemanal(evolucao);
  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const subtitulo = montarSubtituloProgresso(lacunaPrincipal);
  const anosCompletos =
    cobertura?.anos.filter((ano) => ano.completo).length ?? 0;
  const totalAnos = cobertura?.anos.length ?? 0;

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
          className="inline-flex items-center gap-2 rounded-full bg-osmo-accent px-6 py-3 text-sm font-medium text-[var(--osmo-accent-fg)] transition hover:opacity-90"
        >
          Fazer primeiro treino
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  const cardStats: Record<
    (typeof HUB_CARDS)[number]["id"],
    { metric: string; detail: string }
  > = {
    desempenho: {
      metric: `${mediaExibida}%`,
      detail: linhaTendencia ?? "Média geral nas áreas",
    },
    rotina: {
      metric: `${ritmo.diasAtivosNaSemana}/7`,
      detail:
        ritmo.sequenciaAtual > 0
          ? `${ritmo.sequenciaAtual} dias seguidos`
          : "Dias com prática esta semana",
    },
    foco: {
      metric: lacunaPrincipal
        ? (AREA_SIGLAS[lacunaPrincipal.slug] ?? lacunaPrincipal.label)
        : "—",
      detail:
        totalAnos > 0
          ? `${anosCompletos}/${totalAnos} provas ENEM cobertas`
          : (lacunaPrincipal?.mensagem ?? "Seu próximo treino"),
    },
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 md:gap-8">
      <header className="shrink-0 space-y-1.5 px-0.5">
        <p className="hidden text-xs uppercase tracking-[0.18em] text-osmo-subtle sm:block">
          Progresso
        </p>
        <h2 className="text-2xl leading-tight font-medium tracking-tight text-osmo md:text-3xl">
          Seu painel
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-osmo-muted">
          {subtitulo} Escolha uma área para ver os detalhes.
        </p>
      </header>

      <div className="-mx-4 flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden px-4 snap-x snap-mandatory scrollbar-none md:mx-0 md:grid md:h-auto md:flex-none md:grid-cols-2 md:overflow-visible md:px-0 md:snap-none lg:grid-cols-3 lg:gap-6">
        {HUB_CARDS.map((card) => {
          const Icon = card.icon;
          const stats = cardStats[card.id];
          const visual = PROGRESSO_HUB_VISUAL[card.id];

          return (
            <Link
              key={card.id}
              href={card.href}
              className="group block w-[min(82vw,22rem)] shrink-0 snap-start rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-osmo-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--osmo-bg)] max-md:h-full md:w-auto md:min-w-0"
            >
              <GlareCard
                tiltIntensity={10}
                glareColor={`${visual.accent}33`}
                className="flex h-full min-h-0 cursor-pointer flex-col overflow-hidden border-transparent p-1.5 pb-0 shadow-sm transition-shadow hover:shadow-md md:h-[420px]"
                style={{ backgroundColor: visual.frame }}
              >
                <div className="relative h-[38%] min-h-0 shrink-0 overflow-hidden rounded-[1.35rem] md:h-[46%]">
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br",
                      visual.gradient,
                    )}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: visual.glow }}
                  />
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 768px) 82vw, (max-width: 1024px) 50vw, 22rem"
                    className="z-10 object-cover object-center"
                    priority={card.id === "desempenho"}
                  />
                </div>

                <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden bg-[var(--osmo-card)] p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "inline-flex min-w-0 max-w-[85%] items-center gap-2 overflow-hidden rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]",
                        card.badgeClass,
                      )}
                    >
                      <Icon className="size-3.5" />
                      {card.subtitle}
                    </div>
                    <ArrowRight className="size-5 shrink-0 text-osmo-subtle transition group-hover:translate-x-0.5 group-hover:text-osmo-muted" />
                  </div>

                  <div className="mt-2 space-y-2 sm:mt-4 sm:space-y-3">
                    {card.id === "rotina" ? (
                      <div className="flex justify-between gap-0.5">
                        {ritmo.dias.map((dia) => (
                          <div
                            key={dia.label}
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className={cn(
                                "flex size-6 items-center justify-center rounded-full border sm:size-7",
                                dia.ativo
                                  ? card.activeDayClass
                                  : "border-[var(--osmo-border)] bg-[var(--osmo-hover)] text-osmo-subtle",
                                dia.hoje && !dia.ativo && "ring-1 ring-osmo-accent/30",
                              )}
                            >
                              {dia.ativo ? (
                                <Check className="size-3" strokeWidth={2.5} />
                              ) : null}
                            </div>
                            <span className="text-[8px] uppercase tracking-wide text-osmo-subtle sm:text-[9px]">
                              {dia.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : card.id === "desempenho" ? (
                      <div className="flex flex-wrap gap-1.5">
                        {proficiencia.areas.slice(0, 4).map((area) => (
                          <span
                            key={area.slug}
                            className="max-w-full truncate rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-2 py-0.5 text-[10px] text-osmo-muted"
                          >
                            {AREA_SIGLAS[area.slug] ?? area.label.split(" ")[0]} · {area.score}%
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="line-clamp-2 text-xs leading-relaxed text-osmo-muted sm:text-sm">
                        {lacunas.metaSemanal}
                      </p>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-osmo sm:text-xl">
                        {card.title}
                      </h3>
                      <p
                        className="mt-0.5 truncate text-xl font-medium tabular-nums tracking-tight text-osmo sm:text-3xl"
                        title={stats.metric}
                      >
                        {stats.metric}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-osmo-muted sm:text-sm">
                        {stats.detail}
                      </p>
                    </div>
                  </div>
                </div>
              </GlareCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
