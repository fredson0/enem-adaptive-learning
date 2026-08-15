"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ProgressoCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function ProgressoCard({
  icon,
  title,
  children,
  footer,
  className,
  bodyClassName,
}: ProgressoCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-[20px] border border-white/[0.08] bg-[#161616] p-5",
        className,
      )}
    >
      <header className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-white/90">{title}</h3>
      </header>

      <div className={cn("mt-4 flex flex-1 flex-col", bodyClassName)}>
        {children}
      </div>

      {footer ? (
        <div className="mt-4 border-t border-white/[0.06] pt-4">{footer}</div>
      ) : null}
    </article>
  );
}
