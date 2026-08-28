"use client";

import type { TutorQuestaoContext } from "@/components/workspace/tutor-session-provider";
import { formatArea } from "@/lib/simulados";
import { BookOpen, X } from "lucide-react";
import Link from "next/link";

type TutorQuestaoContextBannerProps = {
  context: TutorQuestaoContext;
  onDismiss?: () => void;
};

export function TutorQuestaoContextBanner({
  context,
  onDismiss,
}: TutorQuestaoContextBannerProps) {
  const areaLabel = context.area ? formatArea(context.area) : null;

  return (
    <div className="mx-auto mb-3 flex max-w-3xl items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--osmo-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--osmo-accent)_6%,transparent)] px-4 py-3 text-sm">
      <BookOpen className="mt-0.5 size-4 shrink-0 text-osmo-accent" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium text-osmo">
          Contexto: questão do simulado
        </p>
        <p className="text-osmo-muted">
          ENEM {context.ano} · Questão {context.indice}
          {areaLabel ? ` · ${areaLabel}` : ""}
        </p>
        {context.simuladoId ? (
          <Link
            href={`/simulados/${context.simuladoId}/resultado`}
            className="inline-block text-xs text-osmo-accent underline-offset-2 hover:underline"
          >
            Ver resultado do simulado
          </Link>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-osmo-subtle transition hover:bg-[var(--osmo-hover)] hover:text-osmo-muted"
          aria-label="Ocultar contexto"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
