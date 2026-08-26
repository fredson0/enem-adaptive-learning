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
        "flex flex-col rounded-2xl border border-[var(--osmo-border)] bg-[var(--osmo-card)] p-4 sm:rounded-[20px] sm:p-5",
        className,
      )}
    >
      <header className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[var(--osmo-border)] bg-[var(--osmo-hover)] text-osmo-muted sm:size-8">
          {icon}
        </div>
        <h3 className="text-[13px] font-medium text-osmo sm:text-sm">{title}</h3>
      </header>

      <div className={cn("mt-3 flex flex-1 flex-col sm:mt-4", bodyClassName)}>
        {children}
      </div>

      {footer ? (
        <div className="mt-3 border-t border-[var(--osmo-border)] pt-3 sm:mt-4 sm:pt-4">
          {footer}
        </div>
      ) : null}
    </article>
  );
}
