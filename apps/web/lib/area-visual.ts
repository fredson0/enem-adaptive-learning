import { CORES_AREA, obterIconeTrilha } from "@/lib/trilha-icones";
import { Shuffle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Simulados sem área definida (treino livre) — roxo da paleta Osmo. */
const COR_GERAL = "#7c6cff";

/** Base escura da capa — mesmo canvas do tema. */
const BASE = "#151314";

export type AreaVisual = {
  slug: string | null;
  cor: string;
  icone: LucideIcon;
  /** Gradiente da capa, tingido pela área. */
  gradiente: string;
  /** Brilho radial sobreposto à capa. */
  glow: string;
};

/**
 * Identidade visual de uma área do ENEM — mesma cor e ícone usados na trilha,
 * para que simulado e trilha falem a mesma linguagem.
 */
export function obterVisualArea(area: string | null): AreaVisual {
  const slug = area?.toLowerCase() ?? null;
  const cor = (slug ? CORES_AREA[slug] : undefined) ?? COR_GERAL;
  const icone = slug ? obterIconeTrilha(slug, slug) : Shuffle;

  return {
    slug,
    cor,
    icone,
    gradiente: `linear-gradient(135deg, color-mix(in srgb, ${cor} 34%, ${BASE}) 0%, color-mix(in srgb, ${cor} 10%, ${BASE}) 48%, ${BASE} 100%)`,
    glow: `radial-gradient(circle at 30% 18%, color-mix(in srgb, ${cor} 28%, transparent), transparent 58%)`,
  };
}
