import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ProgressoBlockProps = {
  eyebrow: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function ProgressoBlock({
  eyebrow,
  children,
  className,
  action,
}: ProgressoBlockProps) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-osmo-subtle">
          {eyebrow}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}
