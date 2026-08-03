"use client";

import { cn } from "@/lib/utils";
import { MOCK_CHATS } from "@/lib/workspace-mock";
import {
  PROFILE_NAV,
  TUTOR_NAV,
  WORKSPACE_NAV,
} from "@/lib/workspace-nav";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = {
  label: string;
  href?: string;
};

function getCrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith("/tutor")) {
    const chatId = pathname.match(/^\/tutor\/([^/]+)/)?.[1];
    const chat = chatId
      ? MOCK_CHATS.find((item) => item.id === chatId)
      : undefined;

    if (chat) {
      return [
        { label: TUTOR_NAV.label, href: TUTOR_NAV.href },
        { label: chat.title },
      ];
    }

    return [{ label: TUTOR_NAV.label }];
  }

  const navItem = WORKSPACE_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (navItem) {
    return [{ label: navItem.label }];
  }

  if (pathname.startsWith(PROFILE_NAV.href)) {
    return [{ label: PROFILE_NAV.label }];
  }

  if (pathname.startsWith("/planos")) {
    return [{ label: "Planos" }];
  }

  return [];
}

export function WorkspaceBreadcrumb() {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex max-w-[min(60vw,36rem)] items-center gap-1.5">
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
                  className="size-3 shrink-0 text-white/25"
                  strokeWidth={2}
                  aria-hidden
                />
              )}

              {isLast || !crumb.href ? (
                <span
                  className={cn(
                    "truncate px-3 py-1.5 text-[13px]",
                    isDeepCurrent
                      ? "rounded-[8px] bg-[#2a2a2a] text-white/90"
                      : "rounded-full bg-[#1c1c1c] text-white/60",
                  )}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate rounded-full bg-[#1c1c1c] px-3 py-1.5 text-[13px] text-white/60 transition-colors hover:bg-[#222] hover:text-white/85"
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
