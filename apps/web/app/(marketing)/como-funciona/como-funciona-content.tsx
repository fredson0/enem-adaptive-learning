"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingPlaceholderImage } from "@/components/marketing/marketing-placeholder-image";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import { BarChart3, Brain, Target } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Diagnóstico inicial",
    description:
      "Você responde uma autoavaliação rápida sobre suas áreas fracas, meta de curso e tempo disponível. A plataforma entende de onde você parte.",
    image: MARKETING_IMAGES.diagnostico,
    href: "/trilha-personalizada",
  },
  {
    step: "02",
    title: "Simulados com questões reais",
    description:
      "Mais de 10 mil questões do ENEM, com filtros por área, ano e dificuldade. Peça um simulado em linguagem natural ou escolha o modo treino, cronometrado ou por modalidade.",
    image: MARKETING_IMAGES.simulados,
    href: "/login",
  },
  {
    step: "03",
    title: "Métricas de proficiência",
    description:
      "Cada simulado atualiza sua proficiência por área ENEM. Você vê evolução, lacunas e onde concentrar esforço — sem adivinhar o que estudar.",
    image: MARKETING_IMAGES.metricas,
    href: "/login",
  },
  {
    step: "04",
    title: "Trilha e tutor IA",
    description:
      "Receba um plano sequencial por área e converse com o tutor para montar checklists, tirar dúvidas e entender erros com contexto das suas métricas.",
    image: MARKETING_IMAGES.trilha,
    href: "/tutor-ia",
  },
];

export function ComoFuncionaContent() {
  return (
    <>
      <MarketingHero
        eyebrow="( Como funciona )"
        title="Do diagnóstico à evolução, em um fluxo só"
        description="O ENEM+ combina simulados adaptativos, métricas reais e inteligência artificial para transformar estudo solto em um plano com direção — pensado para quem precisa de inclusão digital de verdade."
        imageSrc={MARKETING_IMAGES.comoFuncionaHero}
        imageAlt="Estudantes colaborando em preparação para o ENEM"
      />

      <section className="bg-white px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <MarketingBlurReveal className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
              ( O ciclo )
            </p>
            <h2 className="font-display mt-5 text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-[#0b1220]">
              Quatro passos que se alimentam
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#0b1220]/65 md:text-lg">
              Não é só mais um banco de questões. Cada etapa gera dados para a
              próxima — e a IA usa esse contexto para personalizar sua jornada.
            </p>
          </MarketingBlurReveal>

          <div className="mt-16 space-y-20">
            {STEPS.map((item, index) => (
              <MarketingBlurReveal
                key={item.step}
                delay={index * 0.06}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <span className="font-mono text-sm tracking-[0.2em] text-[#7c6cff]">
                    {item.step}
                  </span>
                  <h3 className="font-display mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#0b1220] md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#0b1220]/65 md:text-lg">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#0b1220] underline-offset-4 transition hover:underline"
                  >
                    Saiba mais
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <MarketingPlaceholderImage
                  src={item.image}
                  alt={item.title}
                  className="aspect-[4/3] w-full"
                />
              </MarketingBlurReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f3f1] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "IA com contexto",
              text: "O tutor enxerga suas métricas e histórico — não responde no vácuo.",
            },
            {
              icon: Target,
              title: "Foco no ENEM",
              text: "Áreas, disciplinas e prioridades alinhadas ao formato oficial da prova.",
            },
            {
              icon: BarChart3,
              title: "Evolução visível",
              text: "Progresso, lacunas e simulados reunidos num painel simples.",
            },
          ].map((card, index) => (
            <MarketingBlurReveal
              key={card.title}
              delay={index * 0.08}
              className="rounded-3xl border border-black/8 bg-white p-8"
            >
              <card.icon className="size-6 text-[#7c6cff]" strokeWidth={1.75} />
              <h3 className="mt-5 text-xl font-semibold text-[#0b1220]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#0b1220]/65 md:text-base">
                {card.text}
              </p>
            </MarketingBlurReveal>
          ))}
        </div>
      </section>

      <MarketingCtaBand
        title="Pronto para estudar com direção?"
        description="Entre com Google, faça o diagnóstico e receba sua trilha personalizada em minutos."
        ctaLabel="Começar agora"
        ctaHref="/login"
      />
    </>
  );
}
