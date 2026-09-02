import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const TONE_CLASS = {
  desempenho: "text-[#b0ff57]",
  rotina: "text-[#7c6cff]",
  foco: "text-[#60a5fa]",
} as const;

type ProgressoSectionShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  tone?: keyof typeof TONE_CLASS;
};

export function ProgressoSectionShell({
  title,
  description,
  children,
  className,
  tone,
}: ProgressoSectionShellProps) {
  return (
    <div className={cn("mx-auto w-full min-w-0 max-w-6xl", className)}>
      <Link
        href="/progresso"
        className="inline-flex items-center gap-1.5 text-xs text-osmo-muted transition hover:text-osmo sm:text-sm"
      >
        <ArrowLeft className="size-3.5 sm:size-4" />
        Voltar ao hub
      </Link>

      <header className="mt-5 flex flex-col gap-3 border-b border-[var(--osmo-border)] pb-8 sm:mt-7 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="min-w-0">
          {tone ? (
            <p
              className={cn(
                "mb-2 text-[11px] uppercase tracking-[0.2em]",
                TONE_CLASS[tone],
              )}
            >
              Progresso
            </p>
          ) : null}
          <h2 className="text-[1.75rem] leading-[1.1] font-medium tracking-tight text-osmo sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
        </div>
        <p className="max-w-md text-[13px] leading-relaxed text-osmo-muted sm:text-sm lg:pb-1 lg:text-right">
          {description}
        </p>
      </header>

      <div className="flex flex-col gap-10 pt-8 sm:gap-12 sm:pt-10 lg:gap-16">
        {children}
      </div>
    </div>
  );
}
