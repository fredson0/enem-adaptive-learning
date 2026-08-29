"use client";

import { HeroSection } from "@/components/landing/hero-section";
import {
  LandingEntrance,
  shouldSkipLandingEntrance,
} from "@/components/landing/landing-entrance";
import { LandingPlans } from "@/components/landing/landing-plans";
import { LandingPlatformShowcase } from "@/components/landing/landing-platform-showcase";
import { LandingProductShowcase } from "@/components/landing/landing-product-showcase";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { MarketingOsmoFaq } from "@/components/marketing/marketing-osmo-faq";
import { LANDING_ENTRANCE_COLORS } from "@/lib/landing-entrance-tokens";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

type IntroState = "checking" | "intro" | "ready";

export function HomePage() {
  const [introState, setIntroState] = useState<IntroState>("checking");
  const [revealMain, setRevealMain] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  useEffect(() => {
    const skipIntro = shouldSkipLandingEntrance();
    if (skipIntro) {
      setIntroState("ready");
      setRevealMain(true);
      setHeroRevealed(true);
      return;
    }

    setIntroState("intro");
  }, []);

  const handleExpandStart = useCallback(() => {
    setRevealMain(true);
  }, []);

  const handleExpandComplete = useCallback(() => {
    setHeroRevealed(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroState("ready");
    setRevealMain(true);
    setHeroRevealed(true);
  }, []);

  const showMain = introState === "ready" || revealMain;
  const showIntro = introState === "intro";

  if (introState === "checking") {
    return (
      <div
        className="min-h-svh"
        style={{ backgroundColor: LANDING_ENTRANCE_COLORS.background }}
      />
    );
  }

  return (
    <>
      {showMain ? (
        <main
          className={cn(
            "relative min-h-screen bg-[#151314]",
            showIntro && "pointer-events-none",
          )}
        >
          <SiteHeader revealed={heroRevealed} />
          <HeroSection revealed={heroRevealed} />
          <LandingProductShowcase />
          <LandingPlatformShowcase />
          <LandingTestimonials />
          <LandingPlans />
          <MarketingOsmoFaq className="bg-[#f3f3f1]" />
          <SiteFooter />
        </main>
      ) : null}

      {showIntro ? (
        <LandingEntrance
          onExpandStart={handleExpandStart}
          onExpandComplete={handleExpandComplete}
          onComplete={handleIntroComplete}
        />
      ) : null}
    </>
  );
}
