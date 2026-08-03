"use client";

import { PlanBadge } from "@/components/workspace/plan-badge";
import { TutorChatView } from "@/components/workspace/tutor-chat-view";
import { useSearchParams } from "next/navigation";

export function TutorPageClient() {
  const searchParams = useSearchParams();
  const sessionKey = searchParams.get("r") ?? "new";

  return (
    <div className="relative min-h-0 flex-1">
      <div className="absolute top-4 right-4 z-20 md:top-5 md:right-6">
        <PlanBadge />
      </div>
      <TutorChatView key={sessionKey} />
    </div>
  );
}
