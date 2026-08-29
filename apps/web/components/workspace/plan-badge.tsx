"use client";

import { usePlano } from "@/components/workspace/plano-provider";
import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function PlanBadge() {
  const { tokens, loading: tokensLoading } = useTokensIa();
  const { plano, loading: planoLoading } = usePlano();

  const loading = tokensLoading || planoLoading;

  return (
    <Link
      href="/planos"
      aria-busy={loading}
      className="inline-flex max-w-[7.5rem] items-center gap-1.5 truncate rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-chip)] px-2.5 py-1.5 text-[11px] text-osmo-muted transition-colors hover:bg-[var(--osmo-hover)] hover:text-osmo sm:max-w-none sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[13px]"
    >
      <span className="hidden text-osmo-subtle sm:inline">{plano.label}</span>
      <span className="hidden h-3 w-px bg-[var(--osmo-border)] sm:block" />
      <span className="inline-flex min-w-0 items-center gap-1 font-medium sm:gap-1.5">
        <Sparkles className="size-3 shrink-0 text-osmo-accent sm:size-3.5" strokeWidth={1.75} />
        <span className="truncate">
          {loading ? (
            <span className="text-osmo-subtle">…</span>
          ) : tokens.limite >= 999_999 ? (
            <>
              <span className="sm:hidden">Ilimitada</span>
              <span className="hidden sm:inline">IA ilimitada</span>
            </>
          ) : (
            `${tokens.restantes}/${tokens.limite} IA`
          )}
        </span>
      </span>
    </Link>
  );
}
