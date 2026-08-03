"use client";

import { WorkspaceChrome } from "@/components/workspace/workspace-chrome";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function WorkspacePageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isTutor = pathname.startsWith("/tutor");

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" },
    );
  }, [pathname]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-[var(--osmo-surface)] text-white"
    >
      <WorkspaceChrome />
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          !isTutor &&
            "pl-[calc(var(--osmo-sidebar-width)+1.25rem)] md:pl-[calc(var(--osmo-sidebar-width)+1.5rem)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
