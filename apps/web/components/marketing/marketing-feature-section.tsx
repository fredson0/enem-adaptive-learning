"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingPlaceholderImage } from "@/components/marketing/marketing-placeholder-image";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type MarketingFeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
};

type MarketingFeatureSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  items: MarketingFeatureItem[];
  variant?: "light" | "white" | "dark";
};

export function MarketingFeatureSection({
  eyebrow,
  title,
  description,
  items,
  variant = "white",
}: MarketingFeatureSectionProps) {
  const bg =
    variant === "dark"
      ? "bg-[#111111]"
      : variant === "light"
        ? "bg-[#f3f3f1]"
        : "bg-white";

  return (
    <section className={cn("px-4 py-20 md:px-8 md:py-28", bg)}>
      <div className="mx-auto max-w-[1200px]">
        <MarketingBlurReveal className="mx-auto max-w-3xl text-center">
          <p
            className={cn(
              "font-mono text-xs tracking-[0.2em] uppercase",
              variant === "dark" ? "text-[#b0ff57]" : "text-[#7c6cff]",
            )}
          >
            {eyebrow}
          </p>
          <h2
            className={cn(
              "font-display mt-5 text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em]",
              variant === "dark" ? "text-white" : "text-[#0b1220]",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "mt-5 text-base leading-relaxed md:text-lg",
                variant === "dark" ? "text-white/60" : "text-[#0b1220]/65",
              )}
            >
              {description}
            </p>
          ) : null}
        </MarketingBlurReveal>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:gap-10">
          {items.map((item, index) => (
            <MarketingBlurReveal key={item.title} delay={index * 0.08}>
              <article
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-3xl border p-6 md:p-8",
                  variant === "dark"
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-black/8 bg-[#fafaf9]",
                )}
              >
                <item.icon
                  className={cn(
                    "size-6",
                    variant === "dark" ? "text-[#b0ff57]" : "text-[#7c6cff]",
                  )}
                  strokeWidth={1.75}
                />
                <h3
                  className={cn(
                    "mt-5 text-xl font-semibold tracking-tight",
                    variant === "dark" ? "text-white" : "text-[#0b1220]",
                  )}
                >
                  {item.title}
                </h3>
                <p
                  className={cn(
                    "mt-3 flex-1 text-sm leading-relaxed md:text-base",
                    variant === "dark" ? "text-white/60" : "text-[#0b1220]/65",
                  )}
                >
                  {item.description}
                </p>
                {item.imageSrc ? (
                  <MarketingPlaceholderImage
                    src={item.imageSrc}
                    alt={item.imageAlt ?? item.title}
                    className="mt-6 aspect-[16/10] w-full"
                  />
                ) : null}
              </article>
            </MarketingBlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
