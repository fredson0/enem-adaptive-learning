"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { cn } from "@/lib/utils";
import { Caveat } from "next/font/google";
import Link from "next/link";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export type BillingCycle = "monthly" | "annual";

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
    href: "/login",
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
    href: "/login",
    featureCount: "200",
    featureLabel: "tokens IA por dia + prioridade no tutor",
    benefitsHref: "/como-funciona",
  },
};

type MarketingOsmoPlansProps = {
  billing: BillingCycle;
  onBillingChange: (cycle: BillingCycle) => void;
  showToggle?: boolean;
  className?: string;
};

export function MarketingOsmoPlansBillingToggle({
  billing,
  onBillingChange,
  className,
}: Pick<MarketingOsmoPlansProps, "billing" | "onBillingChange" | "className">) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5",
        className,
      )}
    >
      <div className="inline-flex rounded-full border border-[#0b1220]/10 bg-[#f3f3f1] p-1">
        <button
          type="button"
          onClick={() => onBillingChange("monthly")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition",
            billing === "monthly"
              ? "bg-[#0b1220] text-white"
              : "text-[#0b1220]/55 hover:text-[#0b1220]",
          )}
        >
          Mensal
        </button>
        <button
          type="button"
          onClick={() => onBillingChange("annual")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition",
            billing === "annual"
              ? "bg-[#0b1220] text-white"
              : "text-[#0b1220]/55 hover:text-[#0b1220]",
          )}
        >
          Anual
        </button>
      </div>

      {billing === "annual" ? (
        <p
          className={cn(
            caveat.className,
            "text-lg text-[#e04545] sm:absolute sm:right-0 sm:translate-x-[108%]",
          )}
        >
          Economize 20%
          <span className="ml-1 inline-block rotate-12">↘</span>
        </p>
      ) : (
        <p className="text-sm font-medium text-[#0b1220]/45">
          20% off no plano anual
        </p>
      )}
    </div>
  );
}

export function MarketingOsmoPlans({
  billing,
  onBillingChange,
  showToggle = true,
  className,
}: MarketingOsmoPlansProps) {
  const supportPrice =
    billing === "annual"
      ? PLANS.support.annualPrice
      : PLANS.support.monthlyPrice;
  const supportBilling = PLANS.support.billingLabel[billing];

  return (
    <section
      id="planos"
      className={cn("bg-white px-4 pb-20 md:px-8 md:pb-28", className)}
    >
      <div className="mx-auto max-w-[1200px]">
        {showToggle ? (
          <MarketingBlurReveal className="mb-12 flex justify-center md:mb-16">
            <MarketingOsmoPlansBillingToggle
              billing={billing}
              onBillingChange={onBillingChange}
            />
          </MarketingBlurReveal>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <MarketingBlurReveal>
            <article className="flex min-h-[28rem] flex-col rounded-3xl bg-[#5b4dff] p-8 text-white shadow-[0_24px_70px_rgba(91,77,255,0.22)] md:min-h-[30rem] md:p-10">
              <span className="w-fit rounded-md bg-white/15 px-3 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase">
                {PLANS.free.badge}
              </span>

              <h3 className="font-display mt-10 text-[2.75rem] font-semibold tracking-tight md:text-6xl">
                {PLANS.free.name}
              </h3>

              <p className="mt-5 text-4xl font-semibold tracking-tight md:text-[2.75rem]">
                {PLANS.free.monthlyPrice}
              </p>
              <p className="mt-2 text-base text-white/70">
                {PLANS.free.billingLabel.monthly}
              </p>

              <Link
                href={PLANS.free.href}
                className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-[#111111] px-5 py-4 text-base font-medium text-white transition hover:bg-black"
              >
                {PLANS.free.cta}
              </Link>

              <div className="my-8 h-px bg-white/20" />

              <p className="text-base leading-relaxed text-white/85">
                <span className="mr-2 inline-flex rounded-md bg-white/15 px-2.5 py-1 font-semibold tabular-nums">
                  {PLANS.free.featureCount}
                </span>
                {PLANS.free.featureLabel}
              </p>

              <Link
                href={PLANS.free.benefitsHref}
                className="mt-auto pt-8 text-base font-medium text-white underline underline-offset-4 transition hover:text-white/75"
              >
                Ver todos os benefícios
              </Link>
            </article>
          </MarketingBlurReveal>

          <MarketingBlurReveal delay={0.08}>
            <article className="relative flex min-h-[28rem] flex-col rounded-3xl bg-[#111111] p-8 text-white md:min-h-[30rem] md:p-10">
              {billing === "annual" && (
                <p
                  className={cn(
                    caveat.className,
                    "absolute top-6 right-6 max-w-[11rem] text-right text-lg leading-snug text-[#b0ff57] md:top-8 md:right-8",
                  )}
                >
                  Economize mais 20% no anual!
                </p>
              )}

              <span className="w-fit rounded-md bg-white/10 px-3 py-1.5 text-[11px] font-medium tracking-[0.14em] text-white/70 uppercase">
                {PLANS.support.badge}
              </span>

              <h3 className="font-display mt-10 text-[2.75rem] font-semibold tracking-tight md:text-6xl">
                {PLANS.support.name}
              </h3>

              <p className="mt-5 text-4xl font-semibold tracking-tight md:text-[2.75rem]">
                {supportPrice}
              </p>
              <p className="mt-2 text-base text-white/55">{supportBilling}</p>

              <Link
                href={PLANS.support.href}
                className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-[#b0ff57] px-5 py-4 text-base font-medium text-black transition hover:bg-[#c4ff7a]"
              >
                {PLANS.support.cta}
              </Link>

              <div className="my-8 h-px bg-white/10" />

              <p className="text-base leading-relaxed text-white/80">
                <span className="mr-2 inline-flex rounded-md bg-[#b0ff57] px-2.5 py-1 font-semibold text-black tabular-nums">
                  {PLANS.support.featureCount}
                </span>
                {PLANS.support.featureLabel}
              </p>

              <Link
                href={PLANS.support.benefitsHref}
                className="mt-auto pt-8 text-base font-medium text-white/80 underline underline-offset-4 transition hover:text-white"
              >
                Ver todos os benefícios
              </Link>
            </article>
          </MarketingBlurReveal>
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-[#0b1220]/40">
          Checkout com Mercado Pago em breve. Por enquanto, entre com Google para
          testar.
        </p>
      </div>
    </section>
  );
}
