"use client";

import { cn } from "@/lib/utils";
import { getNewTutorChatPath } from "@/lib/tutor-navigation";
import type { MockChat } from "@/lib/workspace-mock";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ChatListProps = {
  chats: MockChat[];
  activeChatId?: string;
  isNewChat?: boolean;
};

export function ChatList({ chats, activeChatId, isNewChat }: ChatListProps) {
  const router = useRouter();

  const handleNewChat = () => {
    router.push(getNewTutorChatPath());
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleNewChat}
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

      {chats.map((chat) => {
        const isActive = activeChatId === chat.id;

        return (
          <Link
            key={chat.id}
            href={`/tutor/${chat.id}`}
            className={cn(
              "block rounded-[6px] px-3 py-2.5 transition-all duration-300 ease-out",
              isActive
                ? "bg-[var(--osmo-active)] text-white"
                : "text-white/60 hover:bg-[var(--osmo-hover)] hover:text-white",
            )}
          >
            <p className="truncate text-sm font-medium">{chat.title}</p>
            <p className="mt-0.5 truncate text-xs text-white/40">
              {chat.preview}
            </p>
            <p className="mt-1 text-[10px] tracking-wide text-white/25 uppercase">
              {chat.updatedAt}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
