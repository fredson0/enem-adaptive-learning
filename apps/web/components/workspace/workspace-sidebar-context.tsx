"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

const MOBILE_QUERY = "(max-width: 1023px)";

type WorkspaceSidebarContextValue = {
  isOpen: boolean;
  isMobile: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const WorkspaceSidebarContext =
  createContext<WorkspaceSidebarContextValue | null>(null);

export function WorkspaceSidebarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const syncMobile = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };

    syncMobile();
    mediaQuery.addEventListener("change", syncMobile);
    return () => mediaQuery.removeEventListener("change", syncMobile);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty(
      "--workspace-content-inset-left",
      isMobile
        ? "1rem"
        : "calc(var(--osmo-sidebar-width) + 1.25rem + 24px)",
    );

    return () => {
      root.style.removeProperty("--workspace-content-inset-left");
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  const value = useMemo(
    () => ({ isOpen, isMobile, open, close, toggle }),
    [isOpen, isMobile, open, close, toggle],
  );

  return (
    <WorkspaceSidebarContext.Provider value={value}>
      {children}
    </WorkspaceSidebarContext.Provider>
  );
}

export function useWorkspaceSidebar() {
  const context = useContext(WorkspaceSidebarContext);
  if (!context) {
    throw new Error(
      "useWorkspaceSidebar must be used within WorkspaceSidebarProvider",
    );
  }
  return context;
}

export const workspaceContentOffsetClass =
  "px-4 lg:pl-[calc(var(--osmo-sidebar-width)+1.25rem)] lg:pr-6";

export const workspaceChromeOffsetClass =
  "px-3 pt-3 sm:pt-3.5 lg:px-5 lg:pt-5 lg:pl-[calc(var(--osmo-sidebar-width)+1.5rem)]";
