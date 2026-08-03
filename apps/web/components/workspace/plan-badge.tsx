import { MOCK_USER } from "@/lib/workspace-mock";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function PlanBadge() {
  const remaining = MOCK_USER.tokensLimit - MOCK_USER.tokensUsed;

  return (
    <Link
      href="/planos"
      className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] px-3 py-2 text-sm text-white transition-all duration-300 hover:bg-[var(--osmo-hover)]"
    >
      <span className="hidden text-white/55 sm:inline">{MOCK_USER.plan}</span>
      <span className="hidden h-3 w-px bg-white/10 sm:block" />
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Sparkles className="size-3.5 text-[#b0ff57]" strokeWidth={1.75} />
        {remaining}/{MOCK_USER.tokensLimit} IA
      </span>
    </Link>
  );
}
