"use client";

import { HeroWave } from "@/components/ui/ai-input-hero";

type TutorChatViewProps = {
  chatTitle?: string;
};

export function TutorChatView({ chatTitle }: TutorChatViewProps) {
  const handleSubmit = (value: string) => {
    if (!value.trim()) return;
    // F3: integrar com POST /ia-tutor/explicar-erro
    console.log("Tutor IA:", { chatTitle, prompt: value });
  };

  return (
    <HeroWave
      key={chatTitle ?? "new-chat"}
      variant="workspace"
      showNavbar={false}
      showHeader={!chatTitle}
      title="Pergunte ao tutor ENEM+"
      subtitle="Explique dúvidas, revise erros de simulado ou peça resumo de qualquer tema do ENEM."
      basePlaceholder="Me explica"
      buttonText="Enviar"
      onPromptSubmit={handleSubmit}
      className="h-full"
    />
  );
}
