"use client";

import { useState } from "react";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { MarketingOsmoFaq } from "@/components/marketing/marketing-osmo-faq";
import { MarketingOsmoHeroShell } from "@/components/marketing/marketing-osmo-hero-shell";
import {
  MarketingOsmoPlans,
  MarketingOsmoPlansBillingToggle,
  type BillingCycle,
} from "@/components/marketing/marketing-osmo-plans";
import { MARKETING_FAQ_CATEGORIES } from "@/lib/marketing-faq";

const PRECOS_FAQ = MARKETING_FAQ_CATEGORIES.filter((category) =>
  ["geral", "ia-planos"].includes(category.id),
);

export function PrecosContent() {
  const [billing, setBilling] = useState<BillingCycle>("annual");

  return (
    <div className="bg-white">
      <MarketingOsmoHeroShell
        variant="light"
        eyebrowLeft="Produto"
        eyebrowRight="Planos"
        title={
          <>
            Tudo que você precisa
            <br />
            em um só lugar.
          </>
        }
        description="Plano gratuito para escolas públicas e plano de apoio simbólico — sustentando simulados, trilha e tutor IA para toda a comunidade."
        accent="inclusão digital de verdade"
      >
        <p className="mb-8 text-sm text-[#0b1220]/45">
          Estude com direção · sem cartão para começar
        </p>
        <MarketingOsmoPlansBillingToggle
          billing={billing}
          onBillingChange={setBilling}
        />
      </MarketingOsmoHeroShell>

      <MarketingOsmoPlans
        billing={billing}
        onBillingChange={setBilling}
        showToggle={false}
      />

      <MarketingOsmoFaq
        categories={PRECOS_FAQ}
        title="Dúvidas sobre"
        titleLine2="planos?"
        accentNote="sem letras miúdas escondidas"
        className="bg-[#fafafa]"
      />

      <MarketingCtaBand
        eyebrow="Quer testar antes de decidir?"
        title="Comece no gratuito hoje"
        description="Faça login com Google, complete o diagnóstico e explore simulados, trilha e tutor IA — sem cartão de crédito."
        ctaLabel="Criar conta grátis"
        ctaHref="/login"
        accentNote="Diagnóstico incluso no gratuito"
        badge="Comece grátis"
      />
    </div>
  );
}
