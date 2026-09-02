"use client";

import {
  ComoFuncionaStickyFeatures,
  type StickyFeatureStep,
} from "@/components/marketing/como-funciona-sticky-features";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingIaRouterSection } from "@/components/marketing/marketing-ia-router-section";
import { MarketingOsmoHeroShell } from "@/components/marketing/marketing-osmo-hero-shell";
import { MARKETING_VIDEOS } from "@/lib/landing-hero-media";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import { Check } from "lucide-react";

const TUTOR_STEPS: StickyFeatureStep[] = [
  {
    step: "01",
    label: "Chat",
    title: "Conversa com contexto real",
    description:
      "Converse sobre qualquer matéria do ENEM. O tutor usa suas métricas de proficiência e histórico de simulados para personalizar explicações — sem respostas genéricas.",
    image: MARKETING_IMAGES.tutorChat,
    imageAlt: "Interface de chat do tutor IA",
  },
  {
    step: "02",
    label: "Visão",
    title: "Envie foto da questão",
    description:
      "Tire foto do caderno ou da prova. A IA analisa a imagem com modelos de visão (NVIDIA Llama Vision, com fallback Groq e Gemini) e explica passo a passo.",
    image: MARKETING_IMAGES.tutorVision,
    imageAlt: "Upload de foto para o tutor",
  },
  {
    step: "03",
    label: "Erros",
    title: "Explicar erro e dicas",
    description:
      "Após um simulado, peça para explicar por que errou. Durante o simulado, receba dicas sem revelar a resposta — como um professor paciente ao seu lado.",
    image: MARKETING_IMAGES.tutorErros,
    imageAlt: "Explicação de erros pós-simulado",
  },
  {
    step: "04",
    label: "Limites",
    title: "Tokens com limite justo",
    description:
      "Plano gratuito com cota diária de tokens; plano Apoio amplia o uso. Rate limiting em tempo real garante que a plataforma continue acessível para todos.",
    image: MARKETING_IMAGES.tutorTokens,
    imageAlt: "Controle de uso de tokens de IA",
  },
];

export function TutorIaContent() {
  return (
    <>
      <MarketingOsmoHeroShell
        variant="dark"
        eyebrowLeft="Produto"
        eyebrowRight="Tutor IA"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b0ff57] px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-black uppercase">
            <Check className="size-3" strokeWidth={2.5} />
            Incluso no gratuito
          </span>
        }
        title="Seu professor particular, disponível 24h"
        titleOffset="pt-[clamp(3.5rem,10vw,6.5rem)] md:pt-[clamp(4rem,11vw,7.5rem)]"
        titleClassName="max-w-[min(100%,22em)] text-[clamp(3.25rem,11vw,7.25rem)] leading-[0.88] tracking-[-0.06em]"
        description="Tire dúvidas, envie fotos de questões, peça explicações de erros e receba orientação alinhada ao seu nível real — powered by NVIDIA NIM com fallback Gemini."
        accent="com contexto real do seu ENEM"
        platformVideo
        platformVideoSrc={MARKETING_VIDEOS.tutor}
      />

      <ComoFuncionaStickyFeatures
        sectionEyebrow="( Recursos )"
        sectionTitle="Muito mais que um chatbot"
        sectionDescription="O tutor foi pensado para o fluxo real de estudo ENEM — integrado a simulados, métricas e trilha."
        steps={TUTOR_STEPS}
        inactivePanelBlur={false}
      />

      <MarketingIaRouterSection />

      <MarketingCtaBand
        title="Converse com o tutor agora"
        description="Faça login, abra o Tutor IA e envie sua primeira pergunta — ou uma foto de exercício."
        ctaLabel="Abrir Tutor IA"
        ctaHref="/login"
      />
    </>
  );
}
