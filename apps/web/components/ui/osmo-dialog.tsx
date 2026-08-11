"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type OsmoDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function OsmoDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: OsmoDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="osmo-dialog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-[14px] border border-white/[0.08] bg-[#161616] p-6 shadow-2xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="osmo-dialog-title"
              className="text-lg font-medium tracking-tight text-white"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-white/70"
            aria-label="Fechar"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
