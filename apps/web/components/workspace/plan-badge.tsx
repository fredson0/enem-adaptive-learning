"use client";

import { useTokensIa } from "@/components/workspace/tokens-ia-provider";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function PlanBadge() {
  const { tokens } = useTokensIa();

  return (
    <Link
      href="/planos"
      className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#1c1c1c] px-3.5 py-2 text-[13px] text-white/80 transition-colors hover:bg-[#222] hover:text-white"
    >
      <span className="hidden text-white/45 sm:inline">Gratuito</span>
      <span className="hidden h-3 w-px bg-white/10 sm:block" />
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Sparkles className="size-3.5 text-[#b0ff57]" strokeWidth={1.75} />
        {tokens.limite >= 999_999
          ? "IA ilimitada"
          : `${tokens.restantes}/${tokens.limite} IA`}
      </span>
    </Link>
  );
}
