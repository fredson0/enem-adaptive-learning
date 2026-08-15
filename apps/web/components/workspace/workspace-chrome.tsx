"use client";

import { PlanBadge } from "@/components/workspace/plan-badge";
import { WorkspaceBreadcrumb } from "@/components/workspace/workspace-breadcrumb";
import { useWorkspaceChromeVisible } from "@/components/workspace/workspace-scroll-context";
import {
  useWorkspaceSidebar,
  workspaceChromeOffsetClass,
} from "@/components/workspace/workspace-sidebar-context";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Tags flutuantes (seção + plano) — portal no body para fixed real com Lenis. */
export function WorkspaceChrome() {
  const [mounted, setMounted] = useState(false);
  const chromeVisible = useWorkspaceChromeVisible();
  const { isMobile, isOpen, open } = useWorkspaceSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-40 transition-[transform,opacity] duration-300 ease-out",
        "border-b border-white/[0.05] bg-[#111111]/95 backdrop-blur-md lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none",
        workspaceChromeOffsetClass,
        chromeVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0",
      )}
    >
      <div className="pointer-events-auto flex items-center gap-1.5 pb-2.5 sm:gap-2 lg:pb-0">
        {isMobile && !isOpen ? (
          <button
            type="button"
            onClick={open}
            aria-label="Abrir menu"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[var(--osmo-sidebar)] text-white/80 transition-colors hover:text-white"
          >
            <Menu className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}

        <div
          className={cn(
            "min-w-0 flex-1 transition-opacity duration-300",
            !chromeVisible && "pointer-events-none",
          )}
        >
          <Suspense fallback={null}>
            <WorkspaceBreadcrumb />
          </Suspense>
        </div>
        <div
          className={cn(
            "shrink-0 transition-opacity duration-300",
            !chromeVisible && "pointer-events-none",
          )}
        >
          <PlanBadge />
        </div>
      </div>
    </div>,
    document.body,
  );
}
