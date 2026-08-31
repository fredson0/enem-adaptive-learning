"use client";

import { ProgressoCard } from "@/components/progresso/progresso-card";
import { usePlanoSemanalIa } from "@/components/trilha/use-plano-semanal-ia";
import type { TrilhaResponse } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  Check,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

type TrilhaPlanoSemanalCardProps = {
  trilha: TrilhaResponse;
  onTrilhaAtualizada?: (trilha: TrilhaResponse) => void;
  className?: string;
  compact?: boolean;
  embedded?: boolean;
};

function formatarDataPlano(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function TrilhaPlanoSemanalCard({
  trilha,
  onTrilhaAtualizada,
  className,
  compact = false,
  embedded = false,
}: TrilhaPlanoSemanalCardProps) {
  const { gerando, togglingId, error, gerarPlano, toggleChecklist } =
    usePlanoSemanalIa({ onTrilhaAtualizada });

  const plano = trilha.planoIa;
  const areaPrioritaria =
    trilha.areas.find((area) => area.slug === trilha.areaPrioritaria) ??
    trilha.areas[0];
  const checklist = trilha.checklistIa;
  const checklistConcluidos = checklist.filter((item) => item.concluida).length;
  const minutosPorDia = Math.max(30, Math.round(trilha.tempoDiarioMinutos / 4));
  const dataPlano = plano?.atualizadoEm
    ? formatarDataPlano(plano.atualizadoEm)
    : null;

  const metaExibida = plano?.metaSemanal ?? trilha.metaSemanal;

  const footerContent = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] text-osmo-subtle">
        {plano
          ? dataPlano
            ? `Atualizado em ${dataPlano}`
            : "Plano personalizado pela IA"
          : `Sugestão automática · ~${minutosPorDia} min/dia`}
      </p>
      <button
        type="button"
        onClick={() => gerarPlano()}
        disabled={gerando}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-3 py-1.5 text-xs font-medium text-osmo transition hover:bg-[var(--osmo-active)] disabled:opacity-60"
      >
        {gerando ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : plano ? (
          <RefreshCw className="size-3.5" />
        ) : (
          <Sparkles className="size-3.5 text-osmo-accent" />
        )}
        {gerando
          ? "Gerando…"
          : plano
            ? "Atualizar plano"
            : "Gerar com IA (1 token)"}
      </button>
    </div>
  );

  const body = (
    <>
      {error ? (
        <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      {plano?.proximoPasso ? (
        <div className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--osmo-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--osmo-accent)_8%,transparent)] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-osmo-accent">
            Hoje
          </p>
          <p className="mt-1 text-sm leading-relaxed text-osmo">
            {plano.proximoPasso}
          </p>
        </div>
      ) : null}

      <p
        className={cn(
          "leading-relaxed text-osmo-muted",
          compact ? "text-[13px]" : "text-sm",
        )}
      >
        {metaExibida}
      </p>

      {plano?.resumo ? (
        <p className="mt-3 text-[13px] leading-relaxed text-osmo-subtle">
          {plano.resumo}
        </p>
      ) : null}

      {trilha.metaEnem ? (
        <p className="mt-3 text-xs text-osmo-subtle">
          <span className="text-osmo-accent">Objetivo ENEM:</span>{" "}
          {trilha.metaEnem}
        </p>
      ) : null}

      {areaPrioritaria ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--osmo-hover)] px-2 py-0.5 text-[10px] text-osmo-muted">
            <Target className="size-3" />
            Foco: {areaPrioritaria.label}
          </span>
          {checklist.length > 0 ? (
            <span className="text-[10px] tabular-nums text-osmo-subtle">
              {checklistConcluidos}/{checklist.length} metas
            </span>
          ) : null}
        </div>
      ) : null}

      {checklist.length > 0 ? (
        <ul
          className={cn(
            "mt-4 space-y-2",
            !embedded && "border-t border-[var(--osmo-border)] pt-4",
          )}
        >
          {checklist.map((item) => {
            const toggling = togglingId === item.id;
            return (
              <li key={item.id} className="flex items-start gap-2.5">
                <button
                  type="button"
                  disabled={toggling}
                  onClick={() =>
                    toggleChecklist(trilha, item.id, !item.concluida)
                  }
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition",
                    item.concluida
                      ? "bg-[color-mix(in_srgb,var(--osmo-accent)_20%,transparent)] text-osmo-accent"
                      : "border border-[var(--osmo-border)] text-transparent hover:border-[color-mix(in_srgb,var(--osmo-accent)_40%,transparent)]",
                    toggling && "opacity-50",
                  )}
                  aria-label={
                    item.concluida ? "Desmarcar meta" : "Marcar meta como feita"
                  }
                >
                  {toggling ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : item.concluida ? (
                    <Check className="size-3" strokeWidth={2.5} />
                  ) : null}
                </button>
                <span
                  className={cn(
                    "text-sm leading-snug",
                    item.concluida
                      ? "text-osmo-subtle line-through"
                      : "text-osmo-muted",
                  )}
                >
                  {item.texto}
                </span>
              </li>
            );
          })}
        </ul>
      ) : !plano ? (
        <p className="mt-4 text-xs leading-relaxed text-osmo-subtle">
          Gere um plano com IA para receber metas semanais baseadas nas suas
          lacunas reais e no ritmo de estudo.
        </p>
      ) : null}

      {areaPrioritaria?.proximaEtapa?.href ? (
        <Link
          href={areaPrioritaria.proximaEtapa.href}
          className="mt-4 inline-flex items-center gap-1 text-xs text-osmo-subtle transition hover:text-osmo"
        >
          Próxima etapa: {areaPrioritaria.proximaEtapa.titulo}
        </Link>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div className={cn("space-y-4", className)}>
        {body}
        <div className="border-t border-[var(--osmo-border)] pt-3">
          {footerContent}
        </div>
      </div>
    );
  }

  return (
    <ProgressoCard
      icon={<CalendarCheck className="size-4 text-osmo-accent" />}
      title="Plano da semana"
      className={className}
      footer={footerContent}
    >
      {body}
    </ProgressoCard>
  );
}
