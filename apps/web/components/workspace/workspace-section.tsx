import { cn } from "@/lib/utils";

/** Espaço reservado para o chrome fixo (tag + plano). */
export const WORKSPACE_CHROME_OFFSET = "pt-[4.75rem] md:pt-[5.75rem]";

type WorkspaceSectionProps = {
  title?: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Layout de seção no padrão Osmo:
 * breadcrumb/actions ficam no chrome; o título desce e o conteúdo vem abaixo.
 */
export function WorkspaceSection({
  title,
  count,
  children,
  className,
  contentClassName,
}: WorkspaceSectionProps) {
  return (
    <div
      className={cn(
        "scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
        className,
      )}
      data-lenis-prevent
      data-workspace-scroll
    >
      <div
        className={cn(
          "px-6 md:px-10 lg:px-12",
          title ? WORKSPACE_CHROME_OFFSET : null,
        )}
      >
        {title ? (
          <h1 className="text-[2.5rem] leading-none font-medium tracking-tight text-white md:text-5xl">
            {title}
            {typeof count === "number" ? (
              <sup className="ml-1.5 align-super text-base font-normal tracking-normal text-white/35 md:text-lg">
                {count}
              </sup>
            ) : null}
          </h1>
        ) : null}
      </div>

      <div
        className={cn(
          "flex-1 px-6 pb-10 md:px-10 md:pb-12 lg:px-12",
          title ? "pt-8 md:pt-10" : WORKSPACE_CHROME_OFFSET,
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
