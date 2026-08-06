"use client";

import { TutorChatView } from "@/components/workspace/tutor-chat-view";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";

export function TutorPageClient() {
  const { sessionKey, activeSession } = useTutorSession();

  return (
    <div className="relative min-h-0 flex-1">
      <TutorChatView
        key={sessionKey}
        initialMessages={activeSession?.messages ?? []}
      />
    </div>
  );
}
