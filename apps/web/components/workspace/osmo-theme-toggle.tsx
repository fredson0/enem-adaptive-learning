"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

export function OsmoThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div
        className="mb-2 h-[52px] rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-card)]"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={cn(
        "mb-2 flex w-full items-center justify-between gap-3 rounded-full border border-[var(--osmo-border)]",
        "bg-[var(--osmo-card)] px-4 py-3 text-left transition",
        "hover:bg-[var(--osmo-hover)]",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        {isDark ? (
          <Moon className="size-4 shrink-0 text-osmo-muted" strokeWidth={1.75} />
        ) : (
          <Sun className="size-4 shrink-0 text-osmo-accent" strokeWidth={1.75} />
        )}
        <span className="truncate text-sm text-osmo">
          {isDark ? "Modo escuro" : "Modo claro"}
        </span>
      </span>

      <span
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors",
          isDark ? "bg-[var(--osmo-active)]" : "bg-[var(--osmo-accent)]",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute size-4 rounded-full bg-white shadow-sm transition-transform",
            isDark ? "translate-x-1" : "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
