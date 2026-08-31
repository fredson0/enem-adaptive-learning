"use client";

import katex from "katex";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";

type Segment =
  | { type: "text"; content: string }
  | { type: "math"; content: string; display: boolean };

const MATH_PATTERN =
  /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;

function parseSegments(text: string): Segment[] {
  const semImagens = text.replace(/!\[[^\]]*]\([^)]+\)/g, "").trim();
  if (!semImagens) return [];

  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of semImagens.matchAll(MATH_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({
        type: "text",
        content: semImagens.slice(lastIndex, index),
      });
    }

    const latex =
      match[1] ?? match[2] ?? match[3] ?? match[4] ?? "";
    const display = Boolean(match[1] || match[4]);

    if (latex.trim()) {
      segments.push({ type: "math", content: latex.trim(), display });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < semImagens.length) {
    segments.push({ type: "text", content: semImagens.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", content: semImagens });
  }

  return segments;
}

function renderTextoComMarkdown(texto: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((parte, index) => {
    const negrito = parte.match(/^\*\*([^*]+)\*\*$/);
    if (negrito) {
      return (
        <strong key={index} className="font-medium text-inherit">
          {negrito[1]}
        </strong>
      );
    }
    return <span key={index}>{parte}</span>;
  });
}

type EnunciadoRichTextProps = {
  text: string;
  className?: string;
};

export function EnunciadoRichText({ text, className }: EnunciadoRichTextProps) {
  const segments = useMemo(() => parseSegments(text), [text]);

  return (
    <div className={cn("whitespace-pre-wrap leading-relaxed", className)}>
      {segments.map((segment, index) => {
        if (segment.type === "math") {
          try {
            const html = katex.renderToString(segment.content, {
              displayMode: segment.display,
              throwOnError: false,
              strict: "ignore",
            });
            return (
              <span
                key={index}
                className={segment.display ? "my-3 block text-center" : "mx-0.5"}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <span key={index} className="font-mono text-inherit">
                {segment.content}
              </span>
            );
          }
        }

        return (
          <span key={index}>{renderTextoComMarkdown(segment.content)}</span>
        );
      })}
    </div>
  );
}
