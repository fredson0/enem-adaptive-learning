import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type ProgressoSectionShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function ProgressoSectionShell({
  title,
  description,
  children,
  className,
}: ProgressoSectionShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-5 py-1 sm:py-2", className)}>
      <Link
        href="/progresso"
        className="inline-flex items-center gap-2 text-sm text-osmo-muted transition hover:text-osmo"
      >
        <ArrowLeft className="size-4" />
        Voltar ao hub
      </Link>

      <header className="space-y-1.5 px-0.5">
        <h2 className="text-2xl font-medium tracking-tight text-osmo md:text-3xl">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-osmo-muted">{description}</p>
      </header>

      {children}
    </div>
  );
}
