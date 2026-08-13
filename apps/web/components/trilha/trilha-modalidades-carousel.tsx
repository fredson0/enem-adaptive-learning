"use client";

import type { TrilhaModalidadeItem } from "@/lib/trilha-catalogo";
import { TRILHA_MODALIDADES } from "@/lib/trilha-catalogo";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

function ModalidadePreviewCard({
  modalidade,
}: {
  modalidade: TrilhaModalidadeItem;
}) {
  return (
    <Link
      href={`/trilha/geral?modalidade=${encodeURIComponent(modalidade.id)}`}
      className="group block w-[148px] shrink-0 sm:w-[160px]"
    >
      <div
        className={cn(
          "relative h-[120px] overflow-hidden rounded-[14px] border border-white/[0.08]",
          "transition duration-300 group-hover:border-white/20 group-hover:brightness-110",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            modalidade.gradient,
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.1),transparent_55%)]" />

        <div className="relative flex h-full flex-col justify-end p-3.5">
          <p className="text-sm font-medium leading-snug text-white">
            {modalidade.nome}
          </p>
        </div>
      </div>
    </Link>
  );
}

type TrilhaModalidadesCarouselProps = {
  modalidades?: TrilhaModalidadeItem[];
  fadeColor?: string;
};

/** Carrossel horizontal de modalidades — card único, sem informação extra. */
export function TrilhaModalidadesCarousel({
  modalidades = TRILHA_MODALIDADES,
  fadeColor = "#161616",
}: TrilhaModalidadesCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const loop = [...modalidades, ...modalidades];
  const duration = Math.max(modalidades.length * 5, 20);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
        style={{
          background: `linear-gradient(to right, ${fadeColor}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
        style={{
          background: `linear-gradient(to left, ${fadeColor}, transparent)`,
        }}
      />

      <motion.div
        className="flex w-max gap-3"
        animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {loop.map((modalidade, index) => (
          <ModalidadePreviewCard
            key={`${modalidade.id}-${index}`}
            modalidade={modalidade}
          />
        ))}
      </motion.div>
    </div>
  );
}
