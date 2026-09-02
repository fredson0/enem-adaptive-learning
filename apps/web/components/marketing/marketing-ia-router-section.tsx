"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingOsmoSectionHeading } from "@/components/marketing/marketing-osmo-section-heading";
import { cn } from "@/lib/utils";

type RouterLane = {
  step: string;
  role: string;
  model: string;
  provider: string;
  detail: string;
  highlight?: boolean;
};

const ROUTER_LANES: RouterLane[] = [
  {
    step: "01",
    role: "Entrada de texto",
    model: "openai/gpt-oss-20b",
    provider: "NVIDIA NIM",
    detail:
      "Tutor, trilha e criação de simulados por linguagem natural — com contexto real do aluno.",
  },
  {
    step: "02",
    role: "Análise de imagem",
    model: "meta/llama-3.2-11b-vision-instruct",
    provider: "NVIDIA NIM",
    detail:
      "Fotos de questões e resoluções no caderno, com compressão no cliente antes do envio.",
  },
  {
    step: "03",
    role: "Fallback automático",
    model: "phi-4-mini → mistral-nemotron → gpt-oss-120b",
    provider: "IaEngineRouter",
    detail:
      "Se o provedor principal falhar, a requisição segue sem derrubar a sessão do estudante.",
    highlight: true,
  },
];

function RouterLaneRow({ lane }: { lane: RouterLane }) {
  return (
    <div
      className={cn(
        "grid gap-6 px-5 py-8 sm:grid-cols-[4.5rem_1fr_auto] sm:items-start sm:gap-8 sm:px-8 sm:py-10 md:px-10",
        lane.highlight && "bg-[#b0ff57]/[0.03]",
      )}
    >
      <p
        className="font-display text-[clamp(2.5rem,6vw,3.5rem)] leading-none font-semibold tracking-[-0.06em] text-white/[0.12]"
        aria-hidden
      >
        {lane.step}
      </p>

      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-[0.22em] text-white/35 uppercase">
          {lane.role}
        </p>
        <p className="font-display mt-3 text-xl font-semibold tracking-[-0.03em] text-white md:text-2xl">
          {lane.model}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45 md:text-base">
          {lane.detail}
        </p>
      </div>

      <span
        className={cn(
          "inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[9px] tracking-[0.18em] uppercase",
          lane.highlight
            ? "border-[#b0ff57]/35 bg-[#b0ff57]/10 text-[#b0ff57]"
            : "border-white/12 bg-white/[0.04] text-white/55",
        )}
      >
        {lane.provider}
      </span>
    </div>
  );
}

export function MarketingIaRouterSection() {
  return (
    <section className="bg-[#f3f3f1]">
      <MarketingOsmoSectionHeading
        eyebrow="( Tecnologia )"
        title="Motor com fallback"
        description="Três caminhos, um roteador. O tutor escolhe o adaptador certo — e troca de provedor sem quebrar a experiência do aluno."
      />

      <MarketingBlurReveal
        delay={0.08}
        className="mx-auto max-w-[1200px] px-4 pb-20 md:px-8 md:pb-28"
      >
        <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#1e1d1b] shadow-[0_32px_80px_rgba(0,0,0,0.14)] md:rounded-[2.25rem]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5 sm:px-8">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-[10px] tracking-wide text-white/35">
                enemplus.app / ia-engine-router
              </span>
            </div>
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#b0ff57]/80 uppercase">
              ports &amp; adapters
            </span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {ROUTER_LANES.map((lane) => (
              <RouterLaneRow key={lane.step} lane={lane} />
            ))}
          </div>

          <div className="border-t border-white/[0.06] px-5 py-4 sm:px-8">
            <p className="font-mono text-[10px] leading-relaxed tracking-[0.08em] text-white/30">
              POST /ia-tutor/mensagens → contexto pedagógico → adaptador →
              resposta socrática
            </p>
          </div>
        </div>
      </MarketingBlurReveal>
    </section>
  );
}
