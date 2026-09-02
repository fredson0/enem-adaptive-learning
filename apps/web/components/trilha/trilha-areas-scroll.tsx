"use client";

import { GlareCard } from "@/components/ui/glare-cards";
import type { TrilhaArea } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const AREA_GRADIENTS: Record<string, string> = {
  matematica: "from-[#1a2a4a] via-[#1e2438] to-[#12141c]",
  linguagens: "from-[#3a1a2a] via-[#2a1824] to-[#141014]",
  humanas: "from-[#3a2a10] via-[#2a2210] to-[#141210]",
  natureza: "from-[#103a2a] via-[#142a22] to-[#101614]",
};

const PRIORIDADE_STYLES = {
  Alta: "bg-red-500/15 text-red-300 border-red-500/20",
  Média: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Baixa: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
} as const;

type TrilhaAreasScrollProps = {
  areas: TrilhaArea[];
  className?: string;
};

function AreaScrollCard({ area }: { area: TrilhaArea }) {
  const proximaEtapa = area.etapas.find((etapa) => !etapa.concluida);

  return (
    <Link
      href={`/trilha/${area.slug}`}
      className="group block h-full w-[min(78vw,280px)] shrink-0 sm:w-[300px]"
    >
      <GlareCard
        tiltIntensity={9}
        glareColor="rgba(176,255,87,0.18)"
        className="h-full overflow-hidden border-white/[0.08] bg-[#161616] p-0"
      >
        <div
          className={cn(
            "relative flex min-h-[220px] flex-col justify-between bg-gradient-to-br p-5",
            AREA_GRADIENTS[area.slug] ?? "from-[#222] via-[#171717] to-[#111]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide",
                PRIORIDADE_STYLES[area.prioridade],
              )}
            >
              {area.prioridade}
            </span>
            <span className="flex size-8 items-center justify-center rounded-full bg-black/30 text-white/70 transition group-hover:bg-black/45 group-hover:text-white">
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </span>
          </div>

          <div>
            <p className="text-xl font-medium tracking-tight text-white">
              {area.label}
            </p>
            <p className="mt-1 text-sm text-white/50">
              {area.progresso}% da trilha
              {area.proficienciaReal > 0
                ? ` · ${area.proficienciaReal}% nos simulados`
                : ""}
            </p>
            {area.disciplinasSugeridas.length > 0 ? (
              <p className="mt-2 line-clamp-2 text-xs text-[#b0ff57]/85">
                Foco: {area.disciplinasSugeridas.join(" · ")}
              </p>
            ) : null}
            {proximaEtapa ? (
              <p className="mt-3 text-xs text-white/40">
                Próximo: {proximaEtapa.titulo}
              </p>
            ) : null}
          </div>
        </div>
      </GlareCard>
    </Link>
  );
}

/** Carrossel horizontal das áreas ENEM — loop contínuo com tilt 3D no hover. */
export function TrilhaAreasScroll({ areas, className }: TrilhaAreasScrollProps) {
  const prefersReducedMotion = useReducedMotion();

  if (areas.length === 0) return null;

  const loop = [...areas, ...areas];
  const duration = Math.max(areas.length * 8, 32);

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          "flex min-w-0 gap-4 overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {areas.map((area) => (
          <AreaScrollCard key={area.slug} area={area} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative min-w-0 w-full overflow-hidden", className)}>
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {loop.map((area, index) => (
          <AreaScrollCard key={`${area.slug}-${index}`} area={area} />
        ))}
      </motion.div>
    </div>
  );
}
