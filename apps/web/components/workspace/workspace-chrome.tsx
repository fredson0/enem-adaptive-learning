"use client";

import { PlanBadge } from "@/components/workspace/plan-badge";
import { WorkspaceBreadcrumb } from "@/components/workspace/workspace-breadcrumb";
import { useWorkspaceChromeVisible } from "@/components/workspace/workspace-scroll-context";
import { cn } from "@/lib/utils";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Tags flutuantes (seção + plano) — portal no body para fixed real com Lenis. */
export function WorkspaceChrome() {
  const [mounted, setMounted] = useState(false);
  const chromeVisible = useWorkspaceChromeVisible();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-3 pt-4 pl-[calc(var(--osmo-sidebar-width)+1.25rem)] transition-[transform,opacity] duration-300 ease-out md:px-5 md:pt-5 md:pl-[calc(var(--osmo-sidebar-width)+1.5rem)]",
        chromeVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto min-w-0 transition-opacity duration-300",
          !chromeVisible && "pointer-events-none",
        )}
      >
        <Suspense fallback={null}>
          <WorkspaceBreadcrumb />
        </Suspense>
      </div>
      <div
        className={cn(
          "pointer-events-auto shrink-0 transition-opacity duration-300",
          !chromeVisible && "pointer-events-none",
        )}
      >
        <PlanBadge />
      </div>
    </div>,
    document.body,
  );
}
