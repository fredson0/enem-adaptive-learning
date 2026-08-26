import type { ModoSimuladoSlug } from "@/lib/simulado-modos";
import { getModoBySlug } from "@/lib/simulado-modos";
import { SIMULADO_MODO_VISUAL } from "@/lib/simulado-modo-visual";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type SimuladoHubCardProps = {
  modoSlug: ModoSimuladoSlug;
  className?: string;
};

/**
 * Card vertical estilo Osmo — moldura envolve a capa;
 * faixa inferior mais grossa com o título dentro do card.
 */
export function SimuladoHubCard({ modoSlug, className }: SimuladoHubCardProps) {
  const modo = getModoBySlug(modoSlug)!;
  const visual = SIMULADO_MODO_VISUAL[modoSlug];
  const Icon = modo.icon;

  return (
    <Link
      href={modo.href}
      className={cn("group mx-auto block w-full max-w-[280px]", className)}
    >
        <div
        className="osmo-surface-dark overflow-hidden rounded-[16px] p-2.5 pb-0 transition duration-300 group-hover:brightness-110"
        style={{ backgroundColor: visual.frame }}
      >
        {/* Capa — imagem dentro da moldura */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[10px]">
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

          <div className="absolute inset-0 flex flex-col items-center justify-center p-5">
            <Icon
              className="mb-3 size-7 opacity-45 transition group-hover:opacity-75"
              style={{ color: visual.accent }}
              strokeWidth={1.25}
            />
            <span
              className="text-[2.25rem] font-medium uppercase leading-none tracking-[0.2em] text-white/90"
              aria-hidden
            >
              {visual.coverLabel}
            </span>
          </div>

          <span className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-black/30 text-white/70 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>

        {/* Faixa inferior — título dentro do card */}
        <div className="flex min-h-[72px] flex-col items-center justify-center px-3 py-5 text-center">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white">
            {modo.label}
          </h3>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-white/35">
            {modo.quantidades.join(" · ")} questões
            {modo.usaCronometro ? " · cronômetro" : ""}
          </p>
        </div>
      </div>

      <p className="mt-3 px-1 text-center text-xs leading-relaxed text-osmo-muted">
        {modo.description}
      </p>
    </Link>
  );
}
