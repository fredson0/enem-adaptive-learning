"use client";

import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { getWorkspaceCrumbs } from "@/lib/workspace-breadcrumbs";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function WorkspaceBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeSession } = useTutorSession();
  const crumbs = getWorkspaceCrumbs(
    pathname,
    searchParams,
    activeSession?.title ?? null,
  );

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 overflow-hidden sm:gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const isDeepCurrent = isLast && crumbs.length > 1;

          return (
            <li
              key={`${crumb.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  className="size-3 shrink-0 text-osmo-subtle"
                  strokeWidth={2}
                  aria-hidden
                />
              )}

              {isLast || !crumb.href ? (
                <span
                  className={cn(
                    "block max-w-[34vw] truncate px-2.5 py-1.5 text-xs sm:max-w-none sm:px-3 sm:text-[13px]",
                    isDeepCurrent
                      ? "rounded-[8px] bg-[var(--osmo-chip-active)] text-osmo"
                      : "rounded-full bg-[var(--osmo-chip)] text-osmo-muted",
                  )}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="block max-w-[34vw] truncate rounded-full bg-[var(--osmo-chip)] px-2.5 py-1.5 text-xs text-osmo-muted transition-colors hover:bg-[var(--osmo-hover)] hover:text-osmo sm:max-w-none sm:px-3 sm:text-[13px]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
