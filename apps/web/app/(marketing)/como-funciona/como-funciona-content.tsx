"use client";

import { ComoFuncionaOsmoHero } from "@/components/marketing/como-funciona-osmo-hero";
import {
  ComoFuncionaStickyFeatures,
  type StickyFeatureStep,
} from "@/components/marketing/como-funciona-sticky-features";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingOsmoFaq } from "@/components/marketing/marketing-osmo-faq";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const STICKY_STEPS: StickyFeatureStep[] = [
  {
    step: "01",
    label: "Diagnóstico",
    title: "Entenda de onde você parte",
    description:
      "Autoavaliação rápida sobre áreas fracas, meta de curso e tempo disponível. A plataforma monta o ponto de partida da sua trilha.",
    image: MARKETING_IMAGES.diagnostico,
    imageAlt: "Diagnóstico inicial na plataforma",
  },
  {
    step: "02",
    label: "Simulados",
    title: "Questões reais do ENEM",
    description:
      "Mais de 10 mil questões com filtros por área, ano e dificuldade. Peça um simulado em linguagem natural ou escolha treino, cronometrado ou modalidade.",
    image: MARKETING_IMAGES.simulados,
    imageAlt: "Simulados adaptativos",
  },
  {
    step: "03",
    label: "Métricas",
    title: "Proficiência que evolui",
    description:
      "Cada simulado atualiza sua proficiência por área ENEM. Você vê lacunas, evolução e onde concentrar esforço — sem adivinhar o que estudar.",
    image: MARKETING_IMAGES.metricas,
    imageAlt: "Métricas de proficiência",
  },
  {
    step: "04",
    label: "Trilha + IA",
    title: "Plano com direção",
    description:
      "Receba etapas sequenciais por área e converse com o tutor para montar checklists, tirar dúvidas e entender erros com contexto real.",
    image: MARKETING_IMAGES.trilha,
    imageAlt: "Trilha personalizada e tutor IA",
  },
];

export function ComoFuncionaContent() {
  return (
    <>
      <ComoFuncionaOsmoHero
        title="Como funciona"
        description="Do diagnóstico à evolução — simulados adaptativos, métricas reais e tutor IA em um fluxo pensado para inclusão digital."
        accent="feito para o ENEM"
      />

      <ComoFuncionaStickyFeatures
        sectionEyebrow="( O ciclo )"
        sectionTitle="Quatro passos que se alimentam"
        sectionDescription="Não é só mais um banco de questões. Cada etapa gera dados para a próxima — e a IA usa esse contexto para personalizar sua jornada."
        steps={STICKY_STEPS}
      />

      <MarketingOsmoFaq />

      <MarketingCtaBand
        title="Pronto para estudar com direção?"
        description="Entre com Google, faça o diagnóstico e receba sua trilha personalizada em minutos."
        ctaLabel="Começar agora"
        ctaHref="/login"
      />
    </>
  );
}
