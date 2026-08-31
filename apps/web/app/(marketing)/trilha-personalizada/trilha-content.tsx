"use client";

import {
  ComoFuncionaStickyFeatures,
  type StickyFeatureStep,
} from "@/components/marketing/como-funciona-sticky-features";
import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingOsmoHeroShell } from "@/components/marketing/marketing-osmo-hero-shell";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import { Check, Route } from "lucide-react";

const TRILHA_STEPS: StickyFeatureStep[] = [
  {
    step: "01",
    label: "Diagnóstico",
    title: "Prioridade onde dói mais",
    description:
      "O diagnóstico cruza autoavaliação com desempenho em simulados para ordenar as quatro áreas do ENEM e sugerir disciplinas dentro de cada uma.",
    image: MARKETING_IMAGES.diagnostico,
    imageAlt: "Diagnóstico inicial da trilha",
  },
  {
    step: "02",
    label: "Checklist",
    title: "Monte sua rotina conversando",
    description:
      "Dentro de cada área, converse com a IA para montar uma checklist realista: quanto tempo você tem, o que revisar primeiro, teoria ou prática.",
    image: MARKETING_IMAGES.checklist,
    imageAlt: "Checklist de estudos personalizada",
  },
  {
    step: "03",
    label: "Áreas",
    title: "Quatro áreas, um plano",
    description:
      "Linguagens, Matemática, Humanas e Natureza — cada uma com etapas sequenciais, simulados sugeridos e marcos de progresso visíveis.",
    image: MARKETING_IMAGES.trilhaAreas,
    imageAlt: "Trilha por área do ENEM",
  },
  {
    step: "04",
    label: "Etapas",
    title: "Do macro ao detalhe",
    description:
      "Treino, modalidade, revisão, tutor e simulado cronometrado. Você sempre sabe o próximo passo e pode refinar o plano com a IA a qualquer momento.",
    image: MARKETING_IMAGES.trilhaEtapas,
    imageAlt: "Etapas sequenciais da trilha",
  },
];

const AREAS = [
  "Linguagens e Códigos",
  "Matemática",
  "Ciências Humanas",
  "Ciências da Natureza",
];

export function TrilhaPersonalizadaContent() {
  return (
    <>
      <MarketingOsmoHeroShell
        variant="dark"
        eyebrowLeft="Produto"
        eyebrowRight="Trilha"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b0ff57] px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-black uppercase">
            <Check className="size-3" strokeWidth={2.5} />
            Incluso no gratuito
          </span>
        }
        title={
          <>
            Um plano feito
            <br />
            para onde você
            <br />
            mais precisa evoluir
          </>
        }
        titleOffset="pt-[clamp(5rem,13vw,9rem)] md:pt-[clamp(5.5rem,14vw,9.5rem)]"
        titleClassName="max-w-[min(100%,26em)] text-[clamp(2.5rem,9vw,6.25rem)] leading-[0.92] tracking-[-0.05em]"
        description="Após o diagnóstico, a plataforma monta uma trilha sequencial por área ENEM — com etapas, orientações e checklist conversacional com IA para adaptar o ritmo ao seu dia a dia."
        accent="prioridade com dados reais"
        platformVideo
      />

      <ComoFuncionaStickyFeatures
        sectionEyebrow="( O fluxo )"
        sectionTitle="Do diagnóstico ao próximo passo"
        sectionDescription="Não é uma lista genérica de tópicos. Cada etapa usa seu desempenho real e conversas com a IA para manter o plano vivo."
        steps={TRILHA_STEPS}
        inactivePanelBlur={false}
      />

      <section className="bg-[#1f1e1c] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <MarketingBlurReveal className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.2em] text-[#b0ff57] uppercase">
              ( Áreas ENEM )
            </p>
            <h2 className="font-display mt-5 text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-[-0.04em] text-white">
              Quatro áreas, uma jornada
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">
              A trilha organiza Linguagens, Matemática, Humanas e Natureza com
              priorização automática — você estuda primeiro o que mais impacta
              sua nota.
            </p>
          </MarketingBlurReveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AREAS.map((area, index) => (
              <MarketingBlurReveal
                key={area}
                delay={index * 0.06}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <Route className="size-5 text-[#b0ff57]" strokeWidth={1.75} />
                <p className="mt-4 text-sm font-semibold text-white">{area}</p>
              </MarketingBlurReveal>
            ))}
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="Monte sua trilha em minutos"
        description="Complete o diagnóstico e receba um plano priorizado — depois refine com a checklist IA em cada área."
        ctaLabel="Começar diagnóstico"
        ctaHref="/login"
      />
    </>
  );
}
