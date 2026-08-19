"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import {
  MARKETING_OSMO_COLORS,
  MARKETING_OSMO_SECTION_TITLE,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";

type MarketingOsmoSectionHeadingProps = {
  title: string;
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
    <MarketingBlurReveal
      className={cn(
        "mx-auto max-w-4xl px-4 pt-20 pb-16 text-center md:px-8 md:pt-28 md:pb-20",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className="font-mono text-xs tracking-[0.2em] uppercase"
          style={{ color: MARKETING_OSMO_COLORS.accentPurple }}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display text-[#0b1220]",
          MARKETING_OSMO_SECTION_TITLE,
          eyebrow ? "mt-5" : "",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
          style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
        >
          {description}
        </p>
      ) : null}
    </MarketingBlurReveal>
  );
}
