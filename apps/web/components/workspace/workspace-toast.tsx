"use client";

import Link from "next/link";
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
import { createPortal } from "react-dom";

type WorkspaceToast = {
  id: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

type WorkspaceToastContextValue = {
  showToast: (toast: Omit<WorkspaceToast, "id">) => void;
};

const WorkspaceToastContext = createContext<WorkspaceToastContextValue | null>(
  null,
);

export function WorkspaceToastProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<WorkspaceToast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    setMounted(true);

    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<WorkspaceToast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, ...toast }]);

      const timer = setTimeout(() => dismiss(id), 7000);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <WorkspaceToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-white/10 bg-[#161616]/95 px-4 py-3 shadow-2xl backdrop-blur-md"
                  role="status"
                >
                  <p className="flex-1 text-sm leading-relaxed text-white/85">
                    {toast.message}
                  </p>
                  {toast.actionHref && toast.actionLabel ? (
                    <Link
                      href={toast.actionHref}
                      onClick={() => dismiss(toast.id)}
                      className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/90"
                    >
                      {toast.actionLabel}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className="shrink-0 text-xs text-white/45 transition hover:text-white"
                    aria-label="Fechar aviso"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </WorkspaceToastContext.Provider>
  );
}

export function useWorkspaceToast() {
  const ctx = useContext(WorkspaceToastContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceToast must be used within WorkspaceToastProvider",
    );
  }
  return ctx;
}
