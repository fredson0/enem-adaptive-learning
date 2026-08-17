"use client";

import {
  MarketingFeatureSection,
  type MarketingFeatureItem,
} from "@/components/marketing/marketing-feature-section";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import {
  Camera,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

const FEATURES: MarketingFeatureItem[] = [
  {
    icon: MessageSquare,
    title: "Chat com contexto real",
    description:
      "Converse sobre qualquer matéria do ENEM. O tutor usa suas métricas de proficiência e histórico de simulados para personalizar explicações — sem respostas genéricas.",
    imageSrc: MARKETING_IMAGES.tutorChat,
    imageAlt: "Interface de chat do tutor IA",
  },
  {
    icon: Camera,
    title: "Envie foto da questão",
    description:
      "Tire foto do caderno ou da prova. A IA analisa a imagem com modelos de visão (NVIDIA Llama Vision, com fallback Groq e Gemini) e explica passo a passo.",
    imageSrc: MARKETING_IMAGES.tutorVision,
    imageAlt: "Upload de foto para o tutor",
  },
  {
    icon: Lightbulb,
    title: "Explicar erro e dicas",
    description:
      "Após um simulado, peça para explicar por que errou. Durante o simulado, receba dicas sem revelar a resposta — como um professor paciente ao seu lado.",
  },
  {
    icon: Zap,
    title: "Tokens com limite justo",
    description:
      "Plano gratuito com cota diária de tokens; plano Apoio amplia o uso. Rate limiting em tempo real garante que a plataforma continue acessível para todos.",
  },
];

export function TutorIaContent() {
  return (
    <>
      <MarketingHero
        eyebrow="( Tutor IA )"
        title="Seu professor particular, disponível 24h"
        description="Tire dúvidas, envie fotos de questões, peça explicações de erros e receba orientação alinhada ao seu nível real — powered by NVIDIA NIM com fallback Gemini."
        imageSrc={MARKETING_IMAGES.tutorHero}
        imageAlt="Estudante usando tutor virtual"
        dark
      />

      <MarketingFeatureSection
        eyebrow="( Recursos )"
        title="Muito mais que um chatbot"
        description="O tutor foi pensado para o fluxo real de estudo ENEM — integrado a simulados, métricas e trilha."
        items={FEATURES}
        variant="white"
      />

      <section className="bg-[#f3f3f1] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <MarketingBlurReveal className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
              ( Tecnologia )
            </p>
            <h2 className="font-display mt-5 text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-[-0.04em] text-[#0b1220]">
              IA robusta com fallback inteligente
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#0b1220]/65 md:text-lg">
              Texto via NVIDIA Llama 3.1, visão via Llama 3.2 Vision. Se um
              provedor falhar, o sistema tenta alternativas automaticamente para
              você não ficar na mão.
            </p>
          </MarketingBlurReveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Texto", value: "Llama 3.1 Instruct" },
              { label: "Visão", value: "Llama 3.2 Vision" },
              { label: "Fallback", value: "Groq → Gemini" },
            ].map((item, index) => (
              <MarketingBlurReveal
                key={item.label}
                delay={index * 0.06}
                className="rounded-2xl border border-black/8 bg-white p-6 text-center"
              >
                <Sparkles className="mx-auto size-5 text-[#7c6cff]" />
                <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-[#0b1220]/45 uppercase">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#0b1220]">
                  {item.value}
                </p>
              </MarketingBlurReveal>
            ))}
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="Converse com o tutor agora"
        description="Faça login, abra o Tutor IA e envie sua primeira pergunta — ou uma foto de exercício."
        ctaLabel="Abrir Tutor IA"
        ctaHref="/login"
      />
    </>
  );
}
