import { TutorChatLegacyRedirect } from "@/components/workspace/tutor-chat-legacy-redirect";

type TutorChatPageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function TutorChatPage({ params }: TutorChatPageProps) {
  const { chatId } = await params;
  return <TutorChatLegacyRedirect chatId={chatId} />;
}
