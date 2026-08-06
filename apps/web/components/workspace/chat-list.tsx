"use client";

import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export function ChatList() {
  const { sessions, activeSessionId, isNewChat, startNewChat, openSession } =
    useTutorSession();

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={startNewChat}
        className={cn(
          "flex w-full items-center gap-2 rounded-[6px] border px-3 py-2 text-left text-sm transition-all duration-300",
          isNewChat
            ? "border-[var(--osmo-border)] bg-[var(--osmo-active)] text-white"
            : "border-dashed border-[var(--osmo-border)] text-white/60 hover:border-white/20 hover:bg-[var(--osmo-hover)] hover:text-white",
        )}
      >
        <Plus className="size-3.5 shrink-0" strokeWidth={1.75} />
        Nova conversa
      </button>

      {sessions.map((chat) => {
        const isActive = activeSessionId === chat.id;
        const preview =
          chat.messages.find((message) => message.role === "assistant")?.texto ??
          chat.messages.find((message) => message.role === "user")?.texto ??
          "Sem mensagens";

        return (
          <button
            key={chat.id}
            type="button"
            onClick={() => openSession(chat.id)}
            className={cn(
              "block w-full rounded-[6px] px-3 py-2.5 text-left transition-all duration-300 ease-out",
              isActive
                ? "bg-[var(--osmo-active)] text-white"
                : "text-white/60 hover:bg-[var(--osmo-hover)] hover:text-white",
            )}
          >
            <p className="truncate text-sm font-medium">{chat.title}</p>
            <p className="mt-0.5 truncate text-xs text-white/40">{preview}</p>
          </button>
        );
      })}
    </div>
  );
}
