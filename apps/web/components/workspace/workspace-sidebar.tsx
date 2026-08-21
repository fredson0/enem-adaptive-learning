"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ChatList } from "@/components/workspace/chat-list";
import {
  SidebarTree,
  SidebarTreeLink,
} from "@/components/workspace/sidebar-tree-nav";
import { SidebarAccordion, sidebarAccordionEase } from "@/components/workspace/sidebar-accordion";
import { UserAvatar } from "@/components/workspace/user-avatar";
import { useWorkspaceSidebar } from "@/components/workspace/workspace-sidebar-context";
import { cn } from "@/lib/utils";
import {
  isActivePath,
  PROFILE_NAV,
  TUTOR_NAV,
  WORKSPACE_NAV,
} from "@/lib/workspace-nav";
import { SIMULADO_MODOS } from "@/lib/simulado-modos";
import { TUTOR_CHAT_PATH } from "@/lib/tutor-navigation";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import {
  Asterisk,
  ChevronRight,
  ClipboardList,
  MoreHorizontal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

type SectionId = "tutor" | "simulados" | "trilha" | "progresso";

const DRAWER_EASE = sidebarAccordionEase;
const SECTION_TRANSITION =
  "transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
const CHEVRON_TRANSITION =
  "transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

const SECTION_BUTTON =
  "flex w-full items-center justify-between rounded-xl px-4 py-4 text-[15px] font-medium leading-none";
const SECTION_BUTTON_ROW =
  "flex w-full items-center gap-3.5 rounded-xl px-4 py-4 text-left text-[15px] font-medium leading-none";
const SECTION_ICON =
  "size-5 transition-colors duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
const SECTION_CHEVRON = "size-4 text-white/40";

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
  const { user, requireAuth } = useAuth();
  const { isMobile, isOpen, close } = useWorkspaceSidebar();

  const [expandedSection, setExpandedSection] = useState<SectionId | null>(
    () => getSectionFromPath(pathname),
  );

  useEffect(() => {
    setExpandedSection(getSectionFromPath(pathname));
  }, [pathname]);

  const guardLink =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (!requireAuth({ next: href })) {
        event.preventDefault();
      }
    };

  const handleSectionClick = (id: SectionId, href: string) => {
    if (id === "tutor") {
      setExpandedSection(id);
      goToTutor();
      return;
    }

    if (!requireAuth({ next: href })) return;

    setExpandedSection(id);
    router.push(href);
  };

  const TutorIcon = TUTOR_NAV.icon;
  const isTutorExpanded = expandedSection === "tutor";
  const isSimuladosExpanded = expandedSection === "simulados";
  const isSimuladosActive = pathname.startsWith("/simulados");

  const sidebarPanel = (
    <>
      <div className="flex shrink-0 items-center justify-between px-5 py-7">
        <Link
          href={TUTOR_CHAT_PATH}
          onClick={(event) => {
            event.preventDefault();
            goToTutor();
            if (isMobile) close();
          }}
          className="text-xl font-bold tracking-[0.16em] text-white uppercase"
        >
          ENEM+
        </Link>
        {isMobile ? (
          <button
            type="button"
            onClick={close}
            aria-label="Fechar menu"
            className="flex size-9 items-center justify-center rounded-full bg-[#b0ff57] text-black transition-transform hover:scale-105"
          >
            <X className="size-4" strokeWidth={2.25} />
          </button>
        ) : (
          <Asterisk className="size-[18px] text-[#b0ff57]" strokeWidth={2} />
        )}
      </div>

      <div
        className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4"
        data-lenis-prevent
      >
        <button
          type="button"
          onClick={() => handleSectionClick("tutor", TUTOR_NAV.href)}
          className={cn(
            SECTION_BUTTON,
            SECTION_TRANSITION,
            isTutorExpanded
              ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
              : "text-white/70 hover:bg-[var(--osmo-hover)] hover:text-white",
          )}
        >
          <span className="inline-flex items-center gap-3.5">
            <TutorIcon
              className={cn(
                SECTION_ICON,
                isTutorExpanded ? "text-[#ff6b6b]" : "text-white/60",
              )}
              strokeWidth={1.75}
            />
            {TUTOR_NAV.label}
          </span>
          <ChevronRight
            className={cn(
              SECTION_CHEVRON,
              CHEVRON_TRANSITION,
              isTutorExpanded && "rotate-90",
            )}
            strokeWidth={1.75}
          />
        </button>

        <SidebarAccordion open={isTutorExpanded} className="mb-2">
          <ChatList />
        </SidebarAccordion>

        <button
          type="button"
          onClick={() => handleSectionClick("simulados", "/simulados")}
          className={cn(
            "mb-1",
            SECTION_BUTTON,
            SECTION_TRANSITION,
            isSimuladosExpanded || isSimuladosActive
              ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
              : "text-white/70 hover:bg-[var(--osmo-hover)] hover:text-white",
          )}
        >
          <span className="inline-flex items-center gap-3.5">
            <ClipboardList
              className={cn(
                SECTION_ICON,
                isSimuladosExpanded || isSimuladosActive
                  ? "text-[#60a5fa]"
                  : "text-white/60",
              )}
              strokeWidth={1.75}
            />
            Simulados
          </span>
          <ChevronRight
            className={cn(
              SECTION_CHEVRON,
              CHEVRON_TRANSITION,
              isSimuladosExpanded && "rotate-90",
            )}
            strokeWidth={1.75}
          />
        </button>

        <SidebarAccordion open={isSimuladosExpanded} className="mb-2">
          <SidebarTree>
            <SidebarTreeLink href="/simulados" active={pathname === "/simulados"} onClick={guardLink("/simulados")}>
              Visão geral
            </SidebarTreeLink>
            {SIMULADO_MODOS.map((modo) => (
              <SidebarTreeLink
                key={modo.slug}
                href={modo.href}
                active={pathname.startsWith(modo.href)}
                onClick={guardLink(modo.href)}
              >
                {modo.shortLabel}
              </SidebarTreeLink>
            ))}
          </SidebarTree>
        </SidebarAccordion>

        <nav className="space-y-1.5">
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
                  SECTION_BUTTON_ROW,
                  SECTION_TRANSITION,
                  isExpanded
                    ? "bg-[var(--osmo-active)] text-white ring-1 ring-white/10"
                    : "text-white/70 hover:bg-[var(--osmo-hover)] hover:text-white",
                )}
              >
                <Icon className={cn(SECTION_ICON, "text-white/60")} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-4">
        <Link
          href={PROFILE_NAV.href}
          onClick={guardLink(PROFILE_NAV.href)}
          className={cn(
            "flex items-center gap-3 rounded-[10px] px-2.5 py-2.5",
            SECTION_TRANSITION,
            isActivePath(pathname, PROFILE_NAV.href)
              ? "bg-[var(--osmo-active)]"
              : "hover:bg-[var(--osmo-hover)]",
          )}
        >
          <UserAvatar
            name={user?.nome ?? "Visitante"}
            fotoUrl={user?.fotoUrl}
            className="size-9"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.nome ?? "Entrar"}
            </p>
            <p className="truncate text-xs text-white/40">
              {user?.email ?? "Faça login para salvar"}
            </p>
          </div>
          <MoreHorizontal
            className="size-4 shrink-0 text-white/30"
            strokeWidth={1.75}
          />
        </Link>
      </div>
    </>
  );

  if (!isMobile) {
    return (
      <aside className="absolute top-1.5 bottom-1.5 left-1.5 z-30 flex w-[var(--osmo-sidebar-width)] flex-col overflow-hidden rounded-[14px] border border-[var(--osmo-border)] bg-[var(--osmo-sidebar)]">
        {sidebarPanel}
      </aside>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            key="workspace-sidebar-backdrop"
            type="button"
            aria-label="Fechar menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: DRAWER_EASE }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-1.5 bottom-1.5 left-1.5 z-50 flex w-[min(var(--osmo-sidebar-width),calc(100vw-0.75rem))] flex-col overflow-hidden rounded-[14px] border border-[var(--osmo-border)] bg-[var(--osmo-sidebar)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] lg:hidden"
        initial={false}
        animate={{ x: isOpen ? 0 : "-108%" }}
        transition={{
          type: "spring",
          damping: 34,
          stiffness: 360,
          mass: 0.82,
        }}
      >
        {sidebarPanel}
      </motion.aside>
    </>
  );
}
