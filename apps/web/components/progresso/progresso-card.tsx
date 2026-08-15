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
        "flex flex-col rounded-2xl border border-white/[0.08] bg-[#161616] p-4 sm:rounded-[20px] sm:p-5",
        className,
      )}
    >
      <header className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 sm:size-8">
          {icon}
        </div>
        <h3 className="text-[13px] font-medium text-white/90 sm:text-sm">{title}</h3>
      </header>

      <div className={cn("mt-3 flex flex-1 flex-col sm:mt-4", bodyClassName)}>
        {children}
      </div>

      {footer ? (
        <div className="mt-3 border-t border-white/[0.06] pt-3 sm:mt-4 sm:pt-4">
          {footer}
        </div>
      ) : null}
    </article>
  );
}
