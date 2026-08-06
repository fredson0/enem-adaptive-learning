"use client";

import { ChatList } from "@/components/workspace/chat-list";
import { SidebarAccordion } from "@/components/workspace/sidebar-accordion";
import { UserAvatar } from "@/components/workspace/user-avatar";
import { cn } from "@/lib/utils";
import {
  isActivePath,
  PROFILE_NAV,
  TUTOR_NAV,
  WORKSPACE_NAV,
} from "@/lib/workspace-nav";
import { fetchMe } from "@/lib/api";
import { type User } from "@/lib/auth";
import { TUTOR_CHAT_PATH } from "@/lib/tutor-navigation";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { Asterisk, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SectionId = "tutor" | "simulados" | "trilha" | "progresso";

function getSectionFromPath(pathname: string): SectionId | null {
  if (pathname.startsWith("/tutor")) return "tutor";
  if (pathname.startsWith("/simulados")) return "simulados";
  if (pathname.startsWith("/trilha")) return "trilha";
  if (pathname.startsWith("/progresso")) return "progresso";
  return null;
}

type WorkspaceSidebarProps = Record<string, never>;

export function WorkspaceSidebar(_props: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { goToTutor } = useTutorSession();

  const [expandedSection, setExpandedSection] = useState<SectionId | null>(
    () => getSectionFromPath(pathname),
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setExpandedSection(getSectionFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleSectionClick = (id: SectionId, href: string) => {
    setExpandedSection(id);
    if (id === "tutor") {
      goToTutor();
      return;
    }
    router.push(href);
  };

  const TutorIcon = TUTOR_NAV.icon;
  const isTutorExpanded = expandedSection === "tutor";

  return (
    <aside className="absolute top-1.5 bottom-1.5 left-1.5 z-30 flex w-[var(--osmo-sidebar-width)] flex-col overflow-hidden rounded-[14px] border border-[var(--osmo-border)] bg-[var(--osmo-sidebar)]">
      <div className="flex shrink-0 items-center justify-between px-6 py-6">
        <Link
          href={TUTOR_CHAT_PATH}
          onClick={(event) => {
            event.preventDefault();
            goToTutor();
          }}
          className="text-lg font-bold tracking-[0.18em] text-white uppercase"
        >
          ENEM+
        </Link>
        <Asterisk className="size-4 text-[#b0ff57]" strokeWidth={2} />
      </div>

      <div className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
        <button
          type="button"
          onClick={() => handleSectionClick("tutor", TUTOR_NAV.href)}
          className={cn(
            "flex w-full items-center justify-between rounded-[10px] px-3.5 py-3 text-sm font-medium transition-all duration-300 ease-out",
            isTutorExpanded
              ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
              : "text-white/70 hover:bg-[var(--osmo-hover)] hover:text-white",
          )}
        >
          <span className="inline-flex items-center gap-3">
            <TutorIcon
              className={cn(
                "size-4 transition-colors duration-300",
                isTutorExpanded ? "text-[#ff6b6b]" : "text-white/60",
              )}
              strokeWidth={1.75}
            />
            {TUTOR_NAV.label}
          </span>
          <ChevronRight
            className={cn(
              "size-3.5 text-white/40 transition-transform duration-300 ease-out",
              isTutorExpanded && "rotate-90",
            )}
            strokeWidth={1.75}
          />
        </button>

        <SidebarAccordion open={isTutorExpanded} className="mb-2">
          <div className="ml-5 border-l border-[var(--osmo-border)] pl-3.5">
            <div className="scrollbar-none max-h-[240px] overflow-y-auto pt-1 pr-1">
              <ChatList />
            </div>
          </div>
        </SidebarAccordion>

        <nav className="space-y-1">
          {WORKSPACE_NAV.map((item) => {
            const sectionId = item.href.replace("/", "") as SectionId;
            const isExpanded = expandedSection === sectionId;
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleSectionClick(sectionId, item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left text-sm font-medium transition-all duration-300 ease-out",
                  isExpanded
                    ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
                    : "text-white/70 hover:bg-[var(--osmo-hover)] hover:text-white",
                )}
              >
                <Icon className="size-4 text-white/60" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-4">
        <Link
          href={PROFILE_NAV.href}
          className={cn(
            "flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 transition-all duration-300 ease-out",
            isActivePath(pathname, PROFILE_NAV.href)
              ? "bg-[var(--osmo-active)]"
              : "hover:bg-[var(--osmo-hover)]",
          )}
        >
          <UserAvatar
            name={user?.nome ?? "Usuário"}
            fotoUrl={user?.fotoUrl}
            className="size-9"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.nome ?? "Usuário"}
            </p>
            <p className="truncate text-xs text-white/40">
              {user?.email ?? ""}
            </p>
          </div>
          <MoreHorizontal
            className="size-4 shrink-0 text-white/30"
            strokeWidth={1.75}
          />
        </Link>
      </div>
    </aside>
  );
}
