"use client";

import { MarketingBlurReveal } from "@/components/marketing/marketing-blur-reveal";
import { MarketingClipTitle } from "@/components/marketing/marketing-clip-title";
import {
  MARKETING_FAQ_CATEGORIES,
  type MarketingFaqCategory,
} from "@/lib/marketing-faq";
import {
  MARKETING_OSMO_COLORS,
  MARKETING_OSMO_SECTION_TITLE,
} from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Caveat } from "next/font/google";
import { useState } from "react";

const FAQ_EASE = [0.22, 1, 0.36, 1] as const;

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

type MarketingOsmoFaqProps = {
  categories?: MarketingFaqCategory[];
  title?: string;
  titleLine2?: string;
  accentNote?: string;
  className?: string;
};

function FaqToggleIcon({
  isOpen,
  reduceMotion,
}: {
  isOpen: boolean;
  reduceMotion: boolean;
}) {
  return (
    <motion.span
      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#0b1220]/12 text-[#0b1220]/70"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.45, ease: FAQ_EASE }
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="text-current"
      >
        <line
          x1="3"
          y1="8"
          x2="13"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <motion.line
          x1="8"
          y1="3"
          x2="8"
          y2="13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transformOrigin: "8px 8px" }}
          initial={{ scaleY: 1, opacity: 1 }}
          animate={{ scaleY: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.35, ease: FAQ_EASE }}
        />
      </svg>
    </motion.span>
  );
}

function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  reduceMotion,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      layout={!reduceMotion}
      className={cn(
        "border-b border-[#0b1220]/10 transition-colors duration-300",
        isOpen && "border-[#0b1220]/10 bg-[#fafaf9]/80",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-6 px-0 py-6 text-left md:py-7"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-[#0b1220] md:text-lg">
          {question}
        </span>
        <FaqToggleIcon isOpen={isOpen} reduceMotion={reduceMotion} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="content"
          initial={{
            height: reduceMotion ? "auto" : 0,
            opacity: reduceMotion ? 1 : 0,
          }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{
            height: reduceMotion ? "auto" : 0,
            opacity: reduceMotion ? 1 : 0,
          }}
            transition={{
              height: { duration: 0.45, ease: FAQ_EASE },
              opacity: { duration: 0.3, ease: "easeOut" },
            }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: reduceMotion ? 0 : -10, opacity: reduceMotion ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reduceMotion ? 0 : -6, opacity: reduceMotion ? 1 : 0 }}
              transition={{ duration: 0.38, ease: FAQ_EASE, delay: 0.04 }}
              className="max-w-3xl pb-6 text-sm leading-relaxed md:pb-7 md:text-base"
              style={{ color: MARKETING_OSMO_COLORS.textMutedDark }}
            >
              {answer}
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function MarketingOsmoFaq({
  categories = MARKETING_FAQ_CATEGORIES,
  title = "Dúvidas?",
  titleLine2 = "Temos respostas.",
  accentNote = "feito por quem também estudou pro ENEM",
  className,
}: MarketingOsmoFaqProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion() ?? false;

  const category =
    categories.find((item) => item.id === activeCategory) ?? categories[0];

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setOpenIndex(0);
  };

  return (
    <section
      className={cn("bg-white px-4 py-20 md:px-8 md:py-28", className)}
    >
      <div className="mx-auto max-w-[800px]">
        <div className="relative text-center">
          <MarketingClipTitle
            as="h2"
            className={cn(
              "font-display text-[#0b1220]",
              MARKETING_OSMO_SECTION_TITLE,
            )}
          >
            {title}
            <br />
            {titleLine2}
          </MarketingClipTitle>
          {accentNote ? (
            <p
              className={cn(
                caveat.className,
                "absolute top-[58%] right-0 hidden max-w-[11rem] translate-x-[20%] -rotate-6 text-lg text-[#e04545] md:block lg:translate-x-[45%]",
              )}
            >
              {accentNote}
              <span className="ml-1 inline-block">↗</span>
            </p>
          ) : null}
        </div>

        <MarketingBlurReveal delay={0.08} className="mt-10 md:mt-12">
          <div className="mx-auto flex w-fit max-w-full flex-wrap justify-center rounded-full border border-[#0b1220]/10 bg-[#f3f3f1] p-1">
            {categories.map((item) => {
              const isActive = item.id === activeCategory;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#0b1220] text-white"
                      : "text-[#0b1220]/60 hover:text-[#0b1220]",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </MarketingBlurReveal>

        <MarketingBlurReveal delay={0.12} className="mt-10 md:mt-12">
          <div className="border-t border-[#0b1220]/10">
            {category.items.map((item, index) => (
              <FaqAccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex((current) =>
                    current === index ? null : index,
                  )
                }
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </MarketingBlurReveal>
      </div>
    </section>
  );
}
