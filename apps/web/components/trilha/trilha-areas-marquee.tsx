"use client";

import type { TrilhaArea } from "@/lib/trilha";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

function areaTone(slug: string) {
  const map: Record<string, string> = {
    matematica: "from-[#4f46e5]/45 to-transparent",
    linguagens: "from-[#db2777]/40 to-transparent",
    humanas: "from-[#d97706]/40 to-transparent",
    natureza: "from-[#059669]/40 to-transparent",
  };
  return map[slug] ?? "from-white/10 to-transparent";
}

function AreaMiniCard({ area }: { area: TrilhaArea }) {
  return (
    <Link
      href={`/trilha/${area.slug}`}
      className="group relative block w-[168px] shrink-0 overflow-hidden rounded-[14px] border border-white/10 bg-[#1a1a1a] transition hover:border-white/25 sm:w-[190px]"
    >
      <div
        className={cn(
          "flex h-28 flex-col justify-between bg-gradient-to-br p-3.5",
          areaTone(area.slug),
        )}
      >
        <span className="w-fit rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
          {area.prioridade}
        </span>
        <div>
          <p className="text-sm font-medium text-white">{area.label}</p>
          <p className="text-xs text-white/50">{area.progresso}%</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-[11px] text-white/45">
        <span className="truncate">
          {area.proximaEtapa?.titulo ??
            area.disciplinasSugeridas[0] ??
            "Ver etapas"}
        </span>
        <ChevronRight className="size-3.5 shrink-0 transition group-hover:translate-x-0.5 group-hover:text-white" />
      </div>
    </Link>
  );
}

type TrilhaAreasMarqueeProps = {
  areas: TrilhaArea[];
};

export function TrilhaAreasMarquee({ areas }: TrilhaAreasMarqueeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (areas.length === 0) return null;

  const loop = [...areas, ...areas];
  const duration = Math.max(areas.length * 6, 18);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#161616] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#161616] to-transparent" />

      <motion.div
        className="flex w-max gap-3"
        animate={
          prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {loop.map((area, index) => (
          <AreaMiniCard key={`${area.slug}-${index}`} area={area} />
        ))}
      </motion.div>
    </div>
  );
}
