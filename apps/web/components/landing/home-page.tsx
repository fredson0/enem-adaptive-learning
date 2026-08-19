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
    setIntroState(skipIntro ? "ready" : "intro");
    if (skipIntro) {
      setHeroRevealed(true);
    }
  }, []);

  const handleExpandStart = useCallback(() => {
    setRevealMain(true);
  }, []);

  const handleExpandComplete = useCallback(() => {
    setHeroRevealed(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroState("ready");
    setHeroRevealed(true);
  }, []);

  const showMain = introState === "ready" || revealMain;
  const showHeroChrome = heroRevealed || introState === "ready";

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
            "relative min-h-screen bg-[#0d0d0d]",
            introState === "intro" && "pointer-events-none",
          )}
        >
          <SiteHeader revealed={showHeroChrome} />
          <HeroSection revealed={showHeroChrome} />
          <LandingProductShowcase />
          <LandingPlatformShowcase />
          <LandingTestimonials />
          <LandingPlans />
          <SiteFooter />
        </main>
      ) : null}

      {introState === "intro" ? (
        <LandingEntrance
          onExpandStart={handleExpandStart}
          onExpandComplete={handleExpandComplete}
          onComplete={handleIntroComplete}
        />
      ) : null}
    </>
  );
}
