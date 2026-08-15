"use client";

import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function PlanBadge() {
  const { tokens } = useTokensIa();

  return (
    <Link
      href="/planos"
      className="inline-flex max-w-[7.5rem] items-center gap-1.5 truncate rounded-full border border-white/[0.06] bg-[#1c1c1c] px-2.5 py-1.5 text-[11px] text-white/80 transition-colors hover:bg-[#222] hover:text-white sm:max-w-none sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[13px]"
    >
      <span className="hidden text-white/45 sm:inline">Gratuito</span>
      <span className="hidden h-3 w-px bg-white/10 sm:block" />
      <span className="inline-flex min-w-0 items-center gap-1 font-medium sm:gap-1.5">
        <Sparkles className="size-3 shrink-0 text-[#b0ff57] sm:size-3.5" strokeWidth={1.75} />
        <span className="truncate">
          {tokens.limite >= 999_999 ? (
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
