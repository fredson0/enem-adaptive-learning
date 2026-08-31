import { obterIconeTrilha } from "@/lib/trilha-icones";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

const TAMANHOS = {
  sm: { caixa: "size-10 rounded-[11px]", glifo: "size-5" },
  md: { caixa: "size-12 sm:size-14 rounded-[15px]", glifo: "size-6 sm:size-7" },
  lg: { caixa: "size-14 sm:size-16 rounded-[18px]", glifo: "size-7 sm:size-8" },
  xl: { caixa: "size-16 sm:size-20 rounded-[22px]", glifo: "size-8 sm:size-10" },
} as const;

type TrilhaIconeProps = {
  /** `id` do catálogo (área, matéria ou assunto). */
  id: string;
  /** Cor da área — o glifo herda por `currentColor`. */
  cor: string;
  areaSlug?: string;
  /** Sobrescreve o glifo do catálogo — para contextos fora da trilha. */
  icone?: LucideIcon;
  size?: keyof typeof TAMANHOS;
  /** Pulso contínuo — usado no card em foco. */
  pulsando?: boolean;
  className?: string;
};

/**
 * Ícone da trilha tingido com a cor da área.
 * Anima na entrada e reage ao hover do card pai (`.group`).
 */
export function TrilhaIcone({
  id,
  cor,
  areaSlug,
  icone,
  size = "md",
  pulsando = false,
  className,
}: TrilhaIconeProps) {
  const Glifo = icone ?? obterIconeTrilha(id, areaSlug);
  const tamanho = TAMANHOS[size];

  return (
    <span
      aria-hidden
      style={{ "--trilha-icone-cor": cor } as CSSProperties}
      className={cn(
        "trilha-icone",
        tamanho.caixa,
        pulsando && "trilha-icone--pulsando",
        className,
      )}
    >
      <Glifo className={cn("trilha-icone__glifo", tamanho.glifo)} strokeWidth={1.75} />
    </span>
  );
}
