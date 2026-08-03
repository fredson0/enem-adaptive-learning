"use client";

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
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-[var(--osmo-surface)] text-white"
    >
      {children}
    </div>
  );
}
