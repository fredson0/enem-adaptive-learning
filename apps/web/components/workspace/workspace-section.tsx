import { cn } from "@/lib/utils";

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
    >
      <div className="px-6 pt-24 md:px-10 md:pt-28 lg:px-12">
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
          "flex-1 px-6 pt-8 pb-10 md:px-10 md:pt-10 md:pb-12 lg:px-12",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
