"use client";

import { MarketingOsmoSectionHeading } from "@/components/marketing/marketing-osmo-section-heading";
import { MarketingPlaceholderImage } from "@/components/marketing/marketing-placeholder-image";
import {
  MARKETING_OSMO_COLORS,
  MARKETING_OSMO_FEATURE_PANEL_HEIGHT,
  MARKETING_OSMO_FEATURE_TITLE,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type StickyFeatureStep = {
  step: string;
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

type ComoFuncionaStickyFeaturesProps = {
  sectionTitle: string;
  sectionDescription?: string;
  sectionEyebrow?: string;
  steps: StickyFeatureStep[];
  /** Desativa blur nos painéis inativos (primeira seção de Tutor/Trilha). */
  inactivePanelBlur?: boolean;
};

function StickyImageFrame({
  steps,
  activeIndex,
  reduceMotion,
}: {
  steps: StickyFeatureStep[];
  activeIndex: number;
  reduceMotion: boolean;
}) {
  const active = steps[activeIndex] ?? steps[0];

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-[2.5rem] border border-black/10 bg-[#e8e8e6] shadow-[0_32px_80px_rgba(0,0,0,0.1)] md:rounded-[3rem]">
      <AnimatePresence mode="sync">
        <motion.div
          key={active.image}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={active.image}
            alt={active.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 420px"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <span className="absolute top-4 left-4 z-10 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-white/80 uppercase backdrop-blur-sm">
        Substituir imagem
      </span>
    </div>
  );
}

function FeaturePanel({
  step,
  isActive,
  reduceMotion,
  panelRef,
  inactivePanelBlur = true,
}: {
  step: StickyFeatureStep;
  isActive: boolean;
  reduceMotion: boolean;
  panelRef: (node: HTMLDivElement | null) => void;
  inactivePanelBlur?: boolean;
}) {
  return (
    <div
      ref={panelRef}
      className={cn(
        "flex items-center",
        MARKETING_OSMO_FEATURE_PANEL_HEIGHT,
      )}
    >
      <motion.div
        animate={
          reduceMotion
            ? { opacity: isActive ? 1 : 0.25 }
            : inactivePanelBlur
              ? {
                  opacity: isActive ? 1 : 0.18,
                  y: isActive ? 0 : -28,
                  filter: isActive ? "blur(0px)" : "blur(2px)",
                }
              : {
                  opacity: isActive ? 1 : 0.35,
                  y: isActive ? 0 : -12,
                }
        }
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl"
      >
        <p
          className="font-mono text-xs tracking-[0.2em] uppercase"
          style={{ color: MARKETING_OSMO_COLORS.accentPurple }}
        >
          {step.label} · {step.step}
        </p>
        <h3
          className={cn(
            "font-display mt-4 text-[#0b1220]",
            MARKETING_OSMO_FEATURE_TITLE,
          )}
        >
          {step.title}
        </h3>
        <p
          className="mt-5 text-base leading-relaxed md:text-lg"
          style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
        >
          {step.description}
        </p>
      </motion.div>
    </div>
  );
}

export function ComoFuncionaStickyFeatures({
  sectionTitle,
  sectionDescription,
  sectionEyebrow,
  steps,
  inactivePanelBlur = true,
}: ComoFuncionaStickyFeaturesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotion = useReducedMotion() ?? false;

  const setPanelRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      panelRefs.current[index] = node;
    },
    [],
  );

  useEffect(() => {
    const nodes = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const index = nodes.indexOf(visible[0].target as HTMLDivElement);
        if (index >= 0) setActiveIndex(index);
      },
      {
        root: null,
        rootMargin: "-42% 0px -42% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <section
      className="bg-[#f3f3f1]"
      style={{ backgroundColor: MARKETING_OSMO_COLORS.sectionBg }}
    >
      <MarketingOsmoSectionHeading
        eyebrow={sectionEyebrow}
        title={sectionTitle}
        description={sectionDescription}
      />

      {/* Mobile: imagem + texto por passo */}
      <div className="space-y-4 px-4 pb-20 lg:hidden md:px-8">
        {steps.map((step) => (
          <article key={step.step} className="space-y-6">
            <MarketingPlaceholderImage
              src={step.image}
              alt={step.imageAlt}
              className="mx-auto aspect-[3/4] w-full max-w-[420px]"
            />
            <div className="mx-auto max-w-xl">
              <p
                className="font-mono text-xs tracking-[0.2em] uppercase"
                style={{ color: MARKETING_OSMO_COLORS.accentPurple }}
              >
                {step.label} · {step.step}
              </p>
              <h3
                className={cn(
                  "font-display mt-3 text-[#0b1220]",
                  MARKETING_OSMO_FEATURE_TITLE,
                )}
              >
                {step.title}
              </h3>
              <p
                className="mt-4 text-base leading-relaxed"
                style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
              >
                {step.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop: sticky image + scroll de texto */}
      <div className="relative mx-auto hidden max-w-[1200px] px-4 pb-28 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          {steps.map((step, index) => (
            <FeaturePanel
              key={step.step}
              step={step}
              isActive={activeIndex === index}
              reduceMotion={reduceMotion}
              panelRef={setPanelRef(index)}
              inactivePanelBlur={inactivePanelBlur}
            />
          ))}
        </div>

        <div className="relative">
          <div className="sticky top-28 flex h-[calc(100vh-7rem)] items-center justify-center">
            <StickyImageFrame
              steps={steps}
              activeIndex={activeIndex}
              reduceMotion={reduceMotion}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
