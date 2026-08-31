import { cn } from "@/lib/utils";
import { Children, type ReactNode } from "react";

type TrilhaCardsGridProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Cards da trilha: carrossel horizontal no mobile, grade no desktop.
 * Dá mais destaque aos ícones centralizados sem espremer em 2 colunas estreitas.
 */
export function TrilhaCardsGrid({ children, className }: TrilhaCardsGridProps) {
  const items = Children.toArray(children);

  if (items.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-none md:hidden",
          className,
        )}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="w-[min(44vw,11rem)] shrink-0 snap-start"
          >
            {item}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "hidden gap-x-4 gap-y-8 md:grid md:grid-cols-4 lg:grid-cols-5",
          className,
        )}
      >
        {items}
      </div>
    </>
  );
}
