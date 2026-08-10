import type { ModoSimuladoSlug } from "@/lib/simulado-modos";
import { getModoBySlug } from "@/lib/simulado-modos";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type SimuladoHubCardProps = {
  modoSlug: ModoSimuladoSlug;
  className?: string;
};

export function SimuladoHubCard({ modoSlug, className }: SimuladoHubCardProps) {
  const modo = getModoBySlug(modoSlug)!;
  const Icon = modo.icon;

  return (
    <Link
      href={modo.href}
      className={cn(
        "group rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 transition hover:border-white/12 hover:bg-[#1a1a1a]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5">
          <Icon className="size-5 text-[#b0ff57]" strokeWidth={1.75} />
        </div>
        <ChevronRight
          className="size-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/55"
          strokeWidth={1.75}
        />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">{modo.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/50">{modo.description}</p>
      <p className="mt-4 text-xs text-white/35">
        {modo.quantidades.join(" · ")} questões
        {modo.usaCronometro ? " · com tempo" : ""}
      </p>
    </Link>
  );
}
