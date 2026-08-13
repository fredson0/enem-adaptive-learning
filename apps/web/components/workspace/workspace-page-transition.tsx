"use client";

import { WorkspaceChrome } from "@/components/workspace/workspace-chrome";
import { TutorPageClient } from "@/components/workspace/tutor-page-client";
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

    gsap.killTweensOf(ref.current);

    if (isTutor) {
      gsap.set(ref.current, { opacity: 1 });
      return;
    }

    gsap.fromTo(
      ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.38, ease: "power2.out" },
    );
  }, [pathname, isTutor]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-[var(--osmo-surface)] text-white"
    >
      <WorkspaceChrome />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "absolute inset-0 flex min-h-0 flex-col",
            !isTutor && "pointer-events-none invisible",
          )}
          aria-hidden={!isTutor}
        >
          <TutorPageClient />
        </div>

        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col",
            isTutor && "pointer-events-none invisible",
            !isTutor &&
              "pl-[calc(var(--osmo-sidebar-width)+1.25rem)] md:pl-[calc(var(--osmo-sidebar-width)+1.5rem)]",
          )}
          aria-hidden={isTutor}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
