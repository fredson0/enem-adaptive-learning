import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type TrilhaCardsGridProps = {
  children: ReactNode;
  className?: string;
};

/** Cards da trilha: 2 por fileira no mobile, grade mais larga no desktop. */
export function TrilhaCardsGrid({ children, className }: TrilhaCardsGridProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
