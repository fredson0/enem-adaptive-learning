"use client";

import { ChatList } from "@/components/workspace/chat-list";
import { SidebarAccordion } from "@/components/workspace/sidebar-accordion";
import { cn } from "@/lib/utils";
import {
  isActivePath,
  PROFILE_NAV,
  TUTOR_NAV,
  WORKSPACE_NAV,
} from "@/lib/workspace-nav";
import { MOCK_CHATS, MOCK_USER } from "@/lib/workspace-mock";
import { getNewTutorChatPath, isNewTutorChatPath } from "@/lib/tutor-navigation";
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

type WorkspaceSidebarProps = {
  activeChatId?: string;
};

export function WorkspaceSidebar({ activeChatId: activeChatIdProp }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const chatIdMatch = pathname.match(/^\/tutor\/([^/]+)/);
  const activeChatId = activeChatIdProp ?? chatIdMatch?.[1];
  const isNewChat = isNewTutorChatPath(pathname);

  const [expandedSection, setExpandedSection] = useState<SectionId | null>(
    () => getSectionFromPath(pathname),
  );

  useEffect(() => {
    setExpandedSection(getSectionFromPath(pathname));
  }, [pathname]);

  const handleSectionClick = (id: SectionId, href: string) => {
    setExpandedSection(id);
    if (id === "tutor") {
      router.push(getNewTutorChatPath());
      return;
    }
    router.push(href);
  };

  const TutorIcon = TUTOR_NAV.icon;
  const isTutorExpanded = expandedSection === "tutor";

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-[14px] border border-[var(--osmo-border)] bg-[var(--osmo-sidebar)]">
      <div className="flex shrink-0 items-center justify-between px-5 py-5">
        <Link
          href={getNewTutorChatPath()}
          className="text-lg font-bold tracking-[0.18em] text-white uppercase"
        >
          ENEM+
        </Link>
        <Asterisk className="size-4 text-[#b0ff57]" strokeWidth={2} />
      </div>

      <div className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
        <button
          type="button"
          onClick={() => handleSectionClick("tutor", TUTOR_NAV.href)}
          className={cn(
            "flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
            isTutorExpanded
              ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
              : "text-white/70 hover:bg-[var(--osmo-hover)] hover:text-white",
          )}
        >
          <span className="inline-flex items-center gap-2.5">
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
          <div className="ml-4 border-l border-[var(--osmo-border)] pl-3">
            <div className="scrollbar-none max-h-[240px] overflow-y-auto pt-1 pr-1">
              <ChatList
                chats={MOCK_CHATS}
                activeChatId={activeChatId}
                isNewChat={isNewChat}
              />
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
                  "flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-sm font-medium transition-all duration-300 ease-out",
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

      <div className="shrink-0 p-3">
        <Link
          href={PROFILE_NAV.href}
          className={cn(
            "flex items-center gap-3 rounded-[8px] px-2 py-2 transition-all duration-300 ease-out",
            isActivePath(pathname, PROFILE_NAV.href)
              ? "bg-[var(--osmo-active)]"
              : "hover:bg-[var(--osmo-hover)]",
          )}
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-[#2a2a2a] text-xs font-semibold text-white">
            {MOCK_USER.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {MOCK_USER.name}
            </p>
            <p className="truncate text-xs text-white/40">{MOCK_USER.email}</p>
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
