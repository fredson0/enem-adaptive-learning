"use client";

import { LandingPlans } from "@/components/landing/landing-plans";
import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingPlaceholderImage } from "@/components/marketing/marketing-placeholder-image";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

const FAQ = [
  {
    q: "O plano gratuito é realmente grátis?",
    a: "Sim. Alunos de escola pública têm acesso ao núcleo da plataforma com limite diário de tokens de IA — suficiente para estudar com consistência sem pagar nada.",
  },
  {
    q: "Para que serve o plano Apoio?",
    a: "Quem pode contribuir com R$ 20/mês amplia a cota de IA e ajuda a manter servidores, banco de questões e modelos de linguagem para toda a comunidade.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "A integração com Mercado Pago está em desenvolvimento. Por enquanto, entre com Google para testar os planos em ambiente de desenvolvimento.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. O modelo é mensal ou anual sem fidelidade — você mantém o gratuito se decidir não renovar o Apoio.",
  },
];

export function PrecosContent() {
  return (
    <>
      <MarketingHero
        eyebrow="( Planos )"
        title="Estudo de qualidade, com modelo que inclui"
        description="Um plano gratuito robusto para escolas públicas e um plano de apoio simbólico para quem pode contribuir — sustentando a IA e a infraestrutura para todos."
        imageSrc={MARKETING_IMAGES.planosImpacto}
        imageAlt="Estudantes em grupo"
        ctaLabel="Ver planos abaixo"
        ctaHref="#planos"
      />

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2">
          <MarketingBlurReveal>
            <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
              ( Impacto social )
            </p>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#0b1220] md:text-4xl">
              Tecnologia de ponta para quem mais precisa
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#0b1220]/65 md:text-lg">
              Este é um TCC com propósito: democratizar preparação para o ENEM
              usando arquitetura escalável e IA generativa. Cada assinatura de
              apoio ajuda a cobrir custos de GPU, storage e banco de dados para
              manter o acesso gratuito viável.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[#0b1220]/70 md:text-base">
              <li>· Simulados ilimitados em todos os planos</li>
              <li>· Trilha personalizada e métricas de proficiência</li>
              <li>· Tutor IA com limite diário proporcional ao plano</li>
              <li>· Foco em estudantes de escolas públicas</li>
            </ul>
          </MarketingBlurReveal>
          <MarketingBlurReveal delay={0.1}>
            <MarketingPlaceholderImage
              src={MARKETING_IMAGES.escolasPublicas}
              alt="Estudantes de escola pública"
              className="aspect-[4/3] w-full"
            />
          </MarketingBlurReveal>
        </div>
      </section>

      <LandingPlans />

      <section className="bg-[#f3f3f1] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[800px]">
          <MarketingBlurReveal className="text-center">
            <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
              ( Dúvidas )
            </p>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#0b1220]">
              Perguntas frequentes
            </h2>
          </MarketingBlurReveal>
          <div className="mt-12 space-y-4">
            {FAQ.map((item, index) => (
              <MarketingBlurReveal
                key={item.q}
                delay={index * 0.05}
                className="rounded-2xl border border-black/8 bg-white p-6"
              >
                <h3 className="text-base font-semibold text-[#0b1220]">
                  {item.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0b1220]/65 md:text-base">
                  {item.a}
                </p>
              </MarketingBlurReveal>
            ))}
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="Comece no gratuito hoje"
        description="Faça login com Google, complete o diagnóstico e explore a plataforma sem cartão de crédito."
        ctaLabel="Criar conta grátis"
        ctaHref="/login"
      />
    </>
  );
}
