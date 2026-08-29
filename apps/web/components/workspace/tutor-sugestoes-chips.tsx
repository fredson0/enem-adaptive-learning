"use client";

import type { SugestaoTutorChip } from "@/lib/tutor-sugestoes";
import { cn } from "@/lib/utils";

type TutorSugestoesChipsProps = {
  sugestoes: SugestaoTutorChip[];
  disabled?: boolean;
  onSelect: (mensagem: string) => void;
};

export function TutorSugestoesChips({
  sugestoes,
  disabled,
  onSelect,
}: TutorSugestoesChipsProps) {
  if (sugestoes.length === 0) return null;

  return (
    <div className="mx-auto mt-4 flex w-full max-w-3xl flex-wrap justify-center gap-2 px-2 sm:mt-6">
      {sugestoes.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item.mensagem)}
          className={cn(
            "rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-3.5 py-2 text-xs text-osmo-muted transition",
            "hover:border-[color-mix(in_srgb,var(--osmo-accent)_30%,transparent)] hover:text-osmo",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
