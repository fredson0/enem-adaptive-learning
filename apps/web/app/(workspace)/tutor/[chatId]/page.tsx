import { PlanBadge } from "@/components/workspace/plan-badge";
import { TutorChatView } from "@/components/workspace/tutor-chat-view";
import { MOCK_CHATS } from "@/lib/workspace-mock";
import { notFound } from "next/navigation";

type TutorChatPageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function TutorChatPage({ params }: TutorChatPageProps) {
  const { chatId } = await params;
  const chat = MOCK_CHATS.find((item) => item.id === chatId);

  if (!chat) {
    notFound();
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div className="absolute top-4 right-4 z-20 md:top-5 md:right-6">
        <PlanBadge />
      </div>
      <TutorChatView key={chatId} chatTitle={chat.title} />
    </div>
  );
}
