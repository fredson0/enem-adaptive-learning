"use client";

import { TutorChatView } from "@/components/workspace/tutor-chat-view";
import { useSearchParams } from "next/navigation";

export function TutorPageClient() {
  const searchParams = useSearchParams();
  const sessionKey = searchParams.get("r") ?? "new";

  return (
    <div className="relative min-h-0 flex-1">
      <TutorChatView key={sessionKey} />
    </div>
  );
}
