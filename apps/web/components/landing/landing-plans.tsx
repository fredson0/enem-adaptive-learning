"use client";

import Link from "next/link";
import { useState } from "react";

type BillingCycle = "monthly" | "annual";

const PLANS = {
  free: {
    badge: "1 usuário",
    name: "Gratuito",
    monthlyPrice: "R$ 0",
    annualPrice: "R$ 0",
    billingLabel: {
      monthly: "Para alunos de escola pública",
      annual: "Para alunos de escola pública",
    },
    cta: "Começar grátis",
    href: "/tutor",
    featureCount: "20",
    featureLabel: "tokens IA por dia, simulados ilimitados",
    benefitsHref: "/como-funciona",
  },
  support: {
    badge: "Apoio ao projeto",
    name: "Apoio",
    monthlyPrice: "R$ 20",
    annualPrice: "R$ 16",
    billingLabel: {
      monthly: "Por mês, cobrado mensalmente",
      annual: "Por mês, cobrado anualmente",
    },
    cta: "Apoiar o projeto",
    href: "/tutor",
    featureCount: "200",
    featureLabel: "tokens IA por dia + prioridade no tutor",
    benefitsHref: "/precos",
  },
};

export function LandingPlans() {
  const [billing, setBilling] = useState<BillingCycle>("annual");

  const supportPrice =
    billing === "annual" ? PLANS.support.annualPrice : PLANS.support.monthlyPrice;
  const supportBilling = PLANS.support.billingLabel[billing];

  return (
    <section
      id="planos"
      data-scroll-section
      className="bg-white px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-display text-center text-[clamp(1.75rem,4.2vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-[#0b1220]">
          Tudo que você precisa em um só lugar
        </h2>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <div className="inline-flex rounded-full border border-[#0b1220]/10 bg-[#f3f3f1] p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billing === "monthly"
                  ? "bg-[#0b1220] text-white"
                  : "text-[#0b1220]/60 hover:text-[#0b1220]"
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billing === "annual"
                  ? "bg-[#0b1220] text-white"
                  : "text-[#0b1220]/60 hover:text-[#0b1220]"
              }`}
            >
              Anual
            </button>
          </div>

          <p className="text-sm font-medium text-[#e04545]">
            Economize 20% no plano anual
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
          {/* Gratuito — card verde (Solo) */}
          <article className="flex min-h-[28rem] flex-col rounded-3xl bg-[#b0ff57] p-8 text-black md:min-h-[30rem] md:p-10">
            <span className="w-fit rounded-md bg-black/15 px-3 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase">
              {PLANS.free.badge}
            </span>

            <h3 className="font-display mt-10 text-[2.75rem] font-semibold tracking-tight md:text-6xl">
              {PLANS.free.name}
            </h3>

            <p className="mt-5 text-4xl font-semibold tracking-tight md:text-[2.75rem]">
              {PLANS.free.monthlyPrice}
            </p>
            <p className="mt-2 text-base text-black/60">
              {PLANS.free.billingLabel.monthly}
            </p>

            <Link
              href={PLANS.free.href}
              className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-[#1f1e1c] px-5 py-4 text-base font-medium text-white transition hover:bg-[#231E1B]"
            >
              {PLANS.free.cta}
            </Link>

            <div className="my-8 h-px bg-black/15" />

            <p className="text-base leading-relaxed text-black/80">
              <span className="mr-2 inline-flex rounded-md bg-black/15 px-2.5 py-1 font-semibold tabular-nums">
                {PLANS.free.featureCount}
              </span>
              {PLANS.free.featureLabel}
            </p>

            <Link
              href={PLANS.free.benefitsHref}
              className="mt-auto pt-8 text-base font-medium text-black underline underline-offset-4 transition hover:text-black/70"
            >
              Ver todos os benefícios
            </Link>
          </article>

          {/* Apoio — card claro (Team) */}
          <article className="relative flex min-h-[28rem] flex-col rounded-3xl bg-[#f3f3f1] p-8 text-[#111111] md:min-h-[30rem] md:p-10">
            {billing === "annual" && (
              <p className="absolute top-6 right-6 max-w-[10rem] text-right text-base leading-snug font-medium text-[#e04545] md:top-8 md:right-8">
                Economize mais 20% no anual!
              </p>
            )}

            <span className="w-fit rounded-md bg-black/10 px-3 py-1.5 text-[11px] font-medium tracking-[0.14em] text-[#111111]/70 uppercase">
              {PLANS.support.badge}
            </span>

            <h3 className="font-display mt-10 text-[2.75rem] font-semibold tracking-tight md:text-6xl">
              {PLANS.support.name}
            </h3>

            <p className="mt-5 text-4xl font-semibold tracking-tight md:text-[2.75rem]">
              {supportPrice}
            </p>
            <p className="mt-2 text-base text-[#111111]/55">{supportBilling}</p>

            <Link
              href={PLANS.support.href}
              className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-[#b0ff57] px-5 py-4 text-base font-medium text-black transition hover:bg-[#c4ff7a]"
            >
              {PLANS.support.cta}
            </Link>

            <div className="my-8 h-px bg-black/10" />

            <p className="text-base leading-relaxed text-[#111111]/80">
              <span className="mr-2 inline-flex rounded-md bg-[#b0ff57] px-2.5 py-1 font-semibold text-black tabular-nums">
                {PLANS.support.featureCount}
              </span>
              {PLANS.support.featureLabel}
            </p>

            <Link
              href={PLANS.support.benefitsHref}
              className="mt-auto pt-8 text-base font-medium text-[#111111] underline underline-offset-4 transition hover:text-[#111111]/70"
            >
              Ver todos os benefícios
            </Link>
          </article>
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-[#0b1220]/40">
          Checkout com Mercado Pago em breve. Por enquanto, entre com Google para
          testar.
        </p>
      </div>
    </section>
  );
}
