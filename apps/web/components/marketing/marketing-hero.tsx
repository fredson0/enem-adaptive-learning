"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingPlaceholderImage } from "@/components/marketing/marketing-placeholder-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type MarketingHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  dark?: boolean;
};

export function MarketingHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt = "Ilustração do produto",
  ctaLabel = "Começar grátis",
  ctaHref = "/login",
  dark = false,
}: MarketingHeroProps) {
  return (
    <section
      className={
        dark
          ? "relative overflow-hidden bg-[#1f1e1c] px-4 pt-32 pb-16 md:px-8 md:pt-40 md:pb-24"
          : "relative overflow-hidden bg-[#f3f3f1] px-4 pt-32 pb-16 md:px-8 md:pt-40 md:pb-24"
      }
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <MarketingBlurReveal>
            <p
              className={
                dark
                  ? "font-mono text-xs tracking-[0.2em] text-[#b0ff57] uppercase"
                  : "font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase"
              }
            >
              {eyebrow}
            </p>
            <h1
              className={
                dark
                  ? "font-display mt-5 text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-white"
                  : "font-display mt-5 text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-[#0b1220]"
              }
            >
              {title}
            </h1>
            <p
              className={
                dark
                  ? "mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
                  : "mt-6 max-w-xl text-base leading-relaxed text-[#0b1220]/65 md:text-lg"
              }
            >
              {description}
            </p>
            <Link
              href={ctaHref}
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[#b0ff57] px-6 text-sm font-medium text-black transition hover:bg-[#c4ff7a]"
            >
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </MarketingBlurReveal>
        </div>

        {imageSrc ? (
          <MarketingBlurReveal delay={0.12}>
            <MarketingPlaceholderImage
              src={imageSrc}
              alt={imageAlt}
              className="aspect-[4/3] w-full lg:aspect-[5/4]"
              priority
            />
          </MarketingBlurReveal>
        ) : null}
      </div>
    </section>
  );
}
