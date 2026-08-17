"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingPlaceholderImage } from "@/components/marketing/marketing-placeholder-image";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import {
  CheckCircle2,
  ClipboardList,
  Map,
  Route,
  Sparkles,
} from "lucide-react";

const AREAS = [
  "Linguagens e Códigos",
  "Matemática",
  "Ciências Humanas",
  "Ciências da Natureza",
];

const ETAPAS = [
  "Diagnóstico e priorização por área",
  "Checklist personalizada com IA",
  "Simulados direcionados",
  "Revisão de lacunas detectadas",
];

export function TrilhaPersonalizadaContent() {
  return (
    <>
      <MarketingHero
        eyebrow="( Trilha )"
        title="Um plano feito para onde você mais precisa evoluir"
        description="Após o diagnóstico, a plataforma monta uma trilha sequencial por área ENEM — com etapas, orientações e checklist conversacional com IA para adaptar o ritmo ao seu dia a dia."
        imageSrc={MARKETING_IMAGES.trilhaHero}
        imageAlt="Estudante seguindo trilha de estudos"
      />

      <section className="bg-white px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2">
          <MarketingPlaceholderImage
            src={MARKETING_IMAGES.checklist}
            alt="Checklist de estudos personalizada"
            className="aspect-[4/3] w-full"
          />
          <MarketingBlurReveal>
            <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
              ( Checklist com IA )
            </p>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#0b1220] md:text-4xl">
              Monte sua rotina conversando
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#0b1220]/65 md:text-lg">
              Dentro de cada área, converse com a IA para montar uma checklist
              realista: quanto tempo você tem, o que revisar primeiro, teoria ou
              prática. O plano vira etapas concretas na sua trilha.
            </p>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#7c6cff]/20 bg-[#7c6cff]/5 p-5">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-[#7c6cff]" />
              <p className="text-sm leading-relaxed text-[#0b1220]/70 md:text-base">
                Exemplo: &quot;Tenho 2h por dia para Matemática, quero focar em
                Funções antes de Geometria&quot; — a IA estrutura dias e tarefas
                para você.
              </p>
            </div>
          </MarketingBlurReveal>
        </div>
      </section>

      <section className="bg-[#111111] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <MarketingBlurReveal className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs tracking-[0.2em] text-[#b0ff57] uppercase">
              ( Áreas ENEM )
            </p>
            <h2 className="font-display mt-5 text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-[-0.04em] text-white">
              Prioridade onde dói mais
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">
              O diagnóstico cruza autoavaliação com desempenho em simulados para
              ordenar as quatro áreas do ENEM e sugerir disciplinas dentro de
              cada uma.
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

      <section className="bg-[#f3f3f1] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2">
          <MarketingBlurReveal>
            <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
              ( Etapas )
            </p>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#0b1220]">
              Do macro ao detalhe
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#0b1220]/65">
              Cada área tem etapas sequenciais: orientações, simulados
              sugeridos e marcos de progresso. Você sempre sabe o próximo passo.
            </p>
            <ul className="mt-8 space-y-4">
              {ETAPAS.map((etapa) => (
                <li
                  key={etapa}
                  className="flex items-start gap-3 text-sm text-[#0b1220]/75 md:text-base"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#7c6cff]" />
                  {etapa}
                </li>
              ))}
            </ul>
          </MarketingBlurReveal>

          <MarketingBlurReveal delay={0.1}>
            <div className="grid gap-4">
              {[
                { icon: Map, title: "Trilha geral", text: "Visão de todas as áreas" },
                {
                  icon: ClipboardList,
                  title: "Checklist IA",
                  text: "Rotina semanal personalizada",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-black/8 bg-white p-6"
                >
                  <card.icon
                    className="size-5 text-[#7c6cff]"
                    strokeWidth={1.75}
                  />
                  <h3 className="mt-4 font-semibold text-[#0b1220]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#0b1220]/65">{card.text}</p>
                </div>
              ))}
              <MarketingPlaceholderImage
                src={MARKETING_IMAGES.trilha}
                alt="Painel da trilha personalizada"
                className="aspect-[16/10] w-full"
              />
            </div>
          </MarketingBlurReveal>
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
