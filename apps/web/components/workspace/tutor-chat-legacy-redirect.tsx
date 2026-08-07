"use client";

import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import { TUTOR_CHAT_PATH } from "@/lib/tutor-navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TutorChatLegacyRedirect({ chatId }: { chatId: string }) {
  const { openSession } = useTutorSession();
  const router = useRouter();

  useEffect(() => {
    void openSession(chatId).finally(() => {
      router.replace(TUTOR_CHAT_PATH);
    });
  }, [chatId, openSession, router]);

  return null;
}
