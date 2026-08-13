"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type WorkspaceScrollContextValue = {
  chromeVisible: boolean;
  onWorkspaceScroll: (scrollTop: number) => void;
};

const WorkspaceScrollContext = createContext<WorkspaceScrollContextValue | null>(
  null,
);

const SCROLL_DELTA = 6;
const TOP_THRESHOLD = 16;

export function WorkspaceScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [chromeVisible, setChromeVisible] = useState(true);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    lastScrollTop.current = 0;
    setChromeVisible(true);
  }, [pathname]);

  const onWorkspaceScroll = useCallback((scrollTop: number) => {
    const delta = scrollTop - lastScrollTop.current;

    if (scrollTop <= TOP_THRESHOLD) {
      setChromeVisible(true);
    } else if (delta > SCROLL_DELTA) {
      setChromeVisible(false);
    } else if (delta < -SCROLL_DELTA) {
      setChromeVisible(true);
    }

    lastScrollTop.current = scrollTop;
  }, []);

  const value = useMemo(
    () => ({ chromeVisible, onWorkspaceScroll }),
    [chromeVisible, onWorkspaceScroll],
  );

  return (
    <WorkspaceScrollContext.Provider value={value}>
      {children}
    </WorkspaceScrollContext.Provider>
  );
}

export function useWorkspaceScroll() {
  const ctx = useContext(WorkspaceScrollContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceScroll must be used within WorkspaceScrollProvider",
    );
  }
  return ctx;
}

/** Hook opcional para áreas de scroll fora do provider direto. */
export function useWorkspaceScrollReporter() {
  const ctx = useContext(WorkspaceScrollContext);
  return ctx?.onWorkspaceScroll ?? (() => undefined);
}

export function useWorkspaceChromeVisible() {
  const ctx = useContext(WorkspaceScrollContext);
  return ctx?.chromeVisible ?? true;
}
