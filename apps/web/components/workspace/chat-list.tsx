"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ChatListItem, getChatPreview } from "@/components/workspace/chat-list-item";
import {
  SidebarTree,
  SidebarTreeButton,
} from "@/components/workspace/sidebar-tree-nav";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { Plus } from "lucide-react";
import { useMemo } from "react";

export function ChatList() {
  const { requireAuth } = useAuth();
  const {
    sessions,
    activeSessionId,
    isNewChat,
    pinnedSessionIds,
    startNewChat,
    openSession,
    deleteSession,
    renameSession,
    togglePinSession,
  } = useTutorSession();

  const orderedSessions = useMemo(() => {
    const pinned = new Set(pinnedSessionIds);
    return [...sessions].sort((a, b) => {
      const aPinned = pinned.has(a.id);
      const bPinned = pinned.has(b.id);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [pinnedSessionIds, sessions]);

  return (
    <SidebarTree scrollable>
      <SidebarTreeButton
        dashed
        active={isNewChat}
        onClick={() => {
          if (!requireAuth({ next: "/tutor" })) return;
          startNewChat();
        }}
      >
        <Plus className="size-3.5 shrink-0" strokeWidth={1.75} />
        Nova conversa
      </SidebarTreeButton>

      {orderedSessions.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          active={activeSessionId === chat.id}
          pinned={pinnedSessionIds.includes(chat.id)}
          preview={getChatPreview(chat)}
          onOpen={() => {
            if (!requireAuth({ next: "/tutor" })) return;
            void openSession(chat.id);
          }}
          onPin={() => {
            if (!requireAuth({ next: "/tutor" })) return;
            togglePinSession(chat.id);
          }}
          onRename={async (titulo) => {
            if (!requireAuth({ next: "/tutor" })) return;
            await renameSession(chat.id, titulo);
          }}
          onDelete={async () => {
            if (!requireAuth({ next: "/tutor" })) return;
            await deleteSession(chat.id);
          }}
        />
      ))}
    </SidebarTree>
  );
}
