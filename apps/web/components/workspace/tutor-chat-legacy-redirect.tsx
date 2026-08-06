"use client";

import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { TUTOR_CHAT_PATH } from "@/lib/tutor-navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TutorChatLegacyRedirect({ chatId }: { chatId: string }) {
  const { openSession, startNewChat } = useTutorSession();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("enem-tutor-sessions");
      const parsed = raw ? JSON.parse(raw) : null;
      const hasSession = parsed?.sessions?.some(
        (session: { id: string }) => session.id === chatId,
      );

      if (hasSession) {
        openSession(chatId);
      } else {
        startNewChat();
      }
    } catch {
      startNewChat();
    }

    router.replace(TUTOR_CHAT_PATH);
  }, [chatId, openSession, router, startNewChat]);

  return null;
}
