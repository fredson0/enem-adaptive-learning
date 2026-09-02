"use client";

import { MARKETING_OSMO_CLIP_TITLE } from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type MarketingClipTitleProps = {
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  /** Hero / above-the-fold — dispara no mount, sem esperar o observer. */
  playOnMount?: boolean;
  children: ReactNode;
};

type Glyph =
  | { kind: "char"; char: string }
  | { kind: "node"; node: ReactNode };

type Line = Glyph[][];

function flattenChildren(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean") return;
    if (isValidElement(child) && child.type === Fragment) {
      out.push(
        ...flattenChildren((child.props as { children?: ReactNode }).children),
      );
      return;
    }
    out.push(child);
  });
  return out;
}

function plainText(children: ReactNode): string {
  return flattenChildren(children)
    .map((node) => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node);
      }
      if (!isValidElement(node)) return "";
      if (node.type === "br") return " ";
      const nested = (node.props as { children?: ReactNode }).children;
      return nested ? plainText(nested) : "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeLines(children: ReactNode): Line[] {
  const nodes = flattenChildren(children);
  const lines: Line[] = [[]];
  let word: Glyph[] = [];

  const flushWord = () => {
    if (word.length === 0) return;
    lines[lines.length - 1].push(word);
    word = [];
  };

  const pushText = (text: string) => {
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        flushWord();
        continue;
      }
      for (const char of [...part]) {
        word.push({ kind: "char", char });
      }
    }
  };

  for (const node of nodes) {
    if (typeof node === "string" || typeof node === "number") {
      pushText(String(node));
      continue;
    }
    if (isValidElement(node) && node.type === "br") {
      flushWord();
      if (lines[lines.length - 1].length > 0) {
        lines.push([]);
      }
      continue;
    }
    if (isValidElement(node)) {
      word.push({ kind: "node", node });
    }
  }

  flushWord();
  return lines.filter((line) => line.length > 0);
}

function useClipReady(playOnMount: boolean) {
  const [ready, setReady] = useState(!playOnMount);

  useEffect(() => {
    if (!playOnMount) return;

    const overlay = document.querySelector("[data-page-transition]");
    const busy = overlay?.getAttribute("data-busy") === "true";

    if (!busy) {
      setReady(true);
      return;
    }

    const onUncover = () => setReady(true);
    window.addEventListener("page-transition:uncover", onUncover);
    const fallback = window.setTimeout(() => setReady(true), 1400);
    return () => {
      window.removeEventListener("page-transition:uncover", onUncover);
      window.clearTimeout(fallback);
    };
  }, [playOnMount]);

  return ready;
}

export function MarketingClipTitle({
  as: Tag = "h2",
  className,
  delay = 0,
  playOnMount = false,
  children,
}: MarketingClipTitleProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.35,
    margin: "0px 0px -8% 0px",
  });
  const reduceMotion = useReducedMotion();
  const skip = reduceMotion === true;
  const gateReady = useClipReady(playOnMount);
  const play =
    skip || (playOnMount ? gateReady : isInView);
  const lines = tokenizeLines(children);
  const label = plainText(children);
  const fromY = skip ? "0%" : MARKETING_OSMO_CLIP_TITLE.fromY;
  const toY = play ? "0%" : MARKETING_OSMO_CLIP_TITLE.fromY;

  let glyphIndex = 0;

  return (
    <Tag
      ref={ref as never}
      aria-label={label || undefined}
      className={cn("text-center", className)}
    >
      <span className="block" aria-hidden={label ? true : undefined}>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            {line.map((word, wordIndex) => (
              <span key={wordIndex}>
                {wordIndex > 0 ? " " : null}
                <span className="inline-block overflow-hidden py-[0.1em] -my-[0.1em] align-bottom whitespace-nowrap">
                  {word.map((glyph, innerIndex) => {
                    const index = glyphIndex;
                    glyphIndex += 1;
                    return (
                      <motion.span
                        key={innerIndex}
                        className="inline-block will-change-transform"
                        initial={{ y: fromY }}
                        animate={{ y: toY }}
                        transition={{
                          duration: skip
                            ? 0
                            : MARKETING_OSMO_CLIP_TITLE.duration,
                          delay: skip
                            ? 0
                            : delay + index * MARKETING_OSMO_CLIP_TITLE.stagger,
                          ease: MARKETING_OSMO_CLIP_TITLE.ease,
                        }}
                      >
                        {glyph.kind === "char" ? glyph.char : glyph.node}
                      </motion.span>
                    );
                  })}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
