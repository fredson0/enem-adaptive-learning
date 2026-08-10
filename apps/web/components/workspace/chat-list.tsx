"use client";

import {
  SidebarTree,
  SidebarTreeButton,
  SidebarTreeChatButton,
} from "@/components/workspace/sidebar-tree-nav";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { Plus } from "lucide-react";

export function ChatList() {
  const { sessions, activeSessionId, isNewChat, startNewChat, openSession } =
    useTutorSession();

  return (
    <SidebarTree scrollable>
      <SidebarTreeButton dashed active={isNewChat} onClick={startNewChat}>
        <Plus className="size-3.5 shrink-0" strokeWidth={1.75} />
        Nova conversa
      </SidebarTreeButton>

      {sessions.map((chat) => {
        const isActive = activeSessionId === chat.id;
        const preview =
          chat.preview ??
          chat.messages.find((message) => message.role === "assistant")?.texto ??
          chat.messages.find((message) => message.role === "user")?.texto ??
          "Sem mensagens";

        return (
          <SidebarTreeChatButton
            key={chat.id}
            active={isActive}
            title={chat.title}
            preview={preview}
            onClick={() => openSession(chat.id)}
          />
        );
      })}
    </SidebarTree>
  );
}
