"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingClipTitle } from "@/components/marketing/marketing-clip-title";
import {
  MARKETING_OSMO_COLORS,
  MARKETING_OSMO_SECTION_TITLE,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type MarketingOsmoSectionHeadingProps = {
  title: ReactNode;
  description?: string;
  eyebrow?: string;
  className?: string;
};

export function MarketingOsmoSectionHeading({
  title,
  description,
  eyebrow,
  className,
}: MarketingOsmoSectionHeadingProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-4xl px-4 pt-20 pb-16 text-center md:px-8 md:pt-28 md:pb-20",
        className,
      )}
    >
      {eyebrow ? (
        <MarketingBlurReveal>
          <p
            className="font-mono text-xs tracking-[0.2em] uppercase"
            style={{ color: MARKETING_OSMO_COLORS.accentPurple }}
          >
            {eyebrow}
          </p>
        </MarketingBlurReveal>
      ) : null}
      <MarketingClipTitle
        as="h2"
        className={cn(
          "font-display text-[#0b1220]",
          MARKETING_OSMO_SECTION_TITLE,
          eyebrow ? "mt-5" : "",
        )}
      >
        {title}
      </MarketingClipTitle>
      {description ? (
        <MarketingBlurReveal delay={0.08}>
          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
          >
            {description}
          </p>
        </MarketingBlurReveal>
      ) : null}
    </div>
  );
}
