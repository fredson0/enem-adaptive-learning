"use client";

import { PlanBadge } from "@/components/workspace/plan-badge";
import { WorkspaceBreadcrumb } from "@/components/workspace/workspace-breadcrumb";
import { Suspense } from "react";

export function WorkspaceChrome() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-3 pt-4 pl-[calc(var(--osmo-sidebar-width)+1.25rem)] md:px-5 md:pt-5 md:pl-[calc(var(--osmo-sidebar-width)+1.5rem)]">
      <div className="pointer-events-auto min-w-0">
        <Suspense fallback={null}>
          <WorkspaceBreadcrumb />
        </Suspense>
      </div>
      <div className="pointer-events-auto shrink-0">
        <PlanBadge />
      </div>
    </div>
  );
}
