"use client";

import { TutorChatView } from "@/components/workspace/tutor-chat-view";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";

export function TutorPageClient() {
  const { activeSession, activeSessionId, sessionKey } = useTutorSession();
  const chatKey = activeSessionId ?? `new-${sessionKey}`;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
      <TutorChatView
        key={chatKey}
        initialMessages={activeSession?.messages ?? []}
      />
    </div>
  );
}
