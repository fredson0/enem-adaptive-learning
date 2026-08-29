"use client";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export type ProductFeature = {
  id: string;
  title: string;
  preview: "simulado" | "metricas" | "tutor" | "trilha" | "progresso";
  accent: string;
};

export const PRODUCT_FEATURES: ProductFeature[] = [
  {
    id: "simulado",
    title: "Simulados adaptativos",
    preview: "simulado",
    accent: "#c8d9bc",
  },
  {
    id: "metricas",
    title: "Métricas por área",
    preview: "metricas",
    accent: "#151314",
  },
  {
    id: "tutor",
    title: "Tutor IA",
    preview: "tutor",
    accent: "#ebe6dc",
  },
  {
    id: "trilha",
    title: "Trilha personalizada",
    preview: "trilha",
    accent: "#ddd6ff",
  },
  {
    id: "progresso",
    title: "Progresso em tempo real",
    preview: "progresso",
    accent: "#c9ebe0",
  },
];

const CARD_COUNT = PRODUCT_FEATURES.length;
const LOOP_DURATION = 24;
const RAD_TO_DEG = 180 / Math.PI;

const CAROUSEL_LAYOUT = {
  section: { spreadXFactor: 0.64, spreadStep: 0.42 },
  background: { spreadXFactor: 0.86, spreadStep: 0.56 },
} as const;

type CarouselLayout = {
  spreadXFactor: number;
  spreadStep: number;
};

function getResponsiveLayout(
  variant: "section" | "background",
  viewportWidth: number,
): CarouselLayout {
  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth < 1024;

  if (variant === "background") {
    if (isMobile) return { spreadXFactor: 1.12, spreadStep: 0.56 };
    if (isTablet) return { spreadXFactor: 0.86, spreadStep: 0.56 };
    return CAROUSEL_LAYOUT.background;
  }

  // Mesma curva do desktop; spread mais aberto no mobile para separar os cards.
  if (isMobile) return { spreadXFactor: 1.28, spreadStep: 0.42 };
  if (isTablet) return { spreadXFactor: 0.72, spreadStep: 0.42 };
  return CAROUSEL_LAYOUT.section;
}

function getVisibleOffset(
  viewportWidth: number,
  variant: "section" | "background",
) {
  if (viewportWidth < 640) return variant === "background" ? 2 : 2.2;
  if (viewportWidth < 1024) return 4;
  return 4.6;
}

function getCopyRange(
  index: number,
  progress: number,
  visibleOffset: number,
) {
  const minCopy = Math.ceil((progress - index - visibleOffset) / CARD_COUNT);
  const maxCopy = Math.floor((progress - index + visibleOffset) / CARD_COUNT);
  const copies: number[] = [];

  for (let copy = minCopy; copy <= maxCopy; copy += 1) {
    copies.push(copy);
  }

  return copies;
}

function getCardTransform(
  linearOffset: number,
  viewportWidth: number,
  layout: CarouselLayout,
) {
  const isMobile = viewportWidth < 640;
  const spreadX = viewportWidth * layout.spreadXFactor;
  const spreadY = spreadX * 0.28;
  const cardSpacing = Math.sin(layout.spreadStep) * spreadX;

  const x = linearOffset * cardSpacing;
  const t = Math.asin(Math.max(-1, Math.min(1, x / spreadX)));
  const y = (1 - Math.cos(Math.abs(t))) * spreadY;
  const rotate =
    Math.atan2(spreadY * Math.sin(t), spreadX * Math.cos(t)) * RAD_TO_DEG;
  const scale = 1 - Math.min(Math.abs(linearOffset) * 0.015, 0.04);
  const fadeStart = isMobile ? 1.2 : 4;
  const fadeRate = isMobile ? 2.4 : 0.8;
  const opacity =
    Math.abs(linearOffset) > fadeStart
      ? Math.max(0, 1 - (Math.abs(linearOffset) - fadeStart) * fadeRate)
      : 1;

  return {
    x,
    y,
    rotate,
    scale,
    opacity,
    zIndex: Math.round(100 - Math.abs(linearOffset) * 10),
  };
}

function getCardWidth(
  variant: "section" | "background",
  viewportWidth: number,
) {
  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth < 1024;

  if (variant === "background") {
    return Math.min(
      Math.max(
        viewportWidth * (isMobile ? 0.32 : isTablet ? 0.28 : 0.24),
        isMobile ? 128 : 260,
      ),
      isMobile ? 156 : 380,
    );
  }

  return Math.min(
    Math.max(
      viewportWidth * (isMobile ? 0.36 : isTablet ? 0.28 : 0.22),
      isMobile ? 140 : 260,
    ),
    isMobile ? 168 : 380,
  );
}

function FeaturePreview({
  type,
  accent,
}: {
  type: ProductFeature["preview"];
  accent: string;
}) {
  if (type === "simulado") {
    return (
      <div
        className="flex h-full flex-col justify-between p-5 md:p-6"
        style={{ backgroundColor: accent }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-[#1a2e12]/70 uppercase md:text-sm">
          Simulado
        </p>
        <div className="grid grid-cols-5 gap-2 md:gap-2.5">
          {["A", "B", "C", "D", "E"].map((letter, i) => (
            <div
              key={letter}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border text-sm font-semibold",
                i === 2
                  ? "border-[#1a2e12]/30 bg-[#1a2e12] text-white"
                  : "border-[#1a2e12]/15 bg-white/55 text-[#1a2e12]/70",
              )}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "metricas") {
    return (
      <div className="flex h-full flex-col justify-center gap-3 bg-[#151314] p-5 md:gap-4 md:p-6">
        {[
          { label: "MAT", value: 72 },
          { label: "LIN", value: 58 },
          { label: "HUM", value: 81 },
          { label: "NAT", value: 64 },
        ].map((area) => (
          <div key={area.label} className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium tracking-[0.12em] text-white/45 md:text-xs">
              <span>{area.label}</span>
              <span>{area.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#b0ff57]"
                style={{ width: `${area.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "tutor") {
    return (
      <div
        className="flex h-full flex-col justify-between p-5 md:p-6"
        style={{ backgroundColor: accent }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-[#3d3428]/70 uppercase md:text-sm">
          Tutor IA
        </p>
        <div className="space-y-2.5">
          <div className="max-w-[88%] rounded-xl rounded-bl-sm bg-white/75 px-3 py-2.5 text-[11px] leading-relaxed text-[#3d3428]/75 md:text-xs">
            Por que errei a questão 12?
          </div>
          <div className="max-w-[92%] ml-auto rounded-xl rounded-br-sm bg-[#1e3a8a] px-3 py-2.5 text-[11px] leading-relaxed text-white/90 md:text-xs">
            Você confundiu velocidade média com aceleração…
          </div>
        </div>
      </div>
    );
  }

  if (type === "trilha") {
    return (
      <div
        className="flex h-full flex-col justify-between p-5 md:p-6"
        style={{ backgroundColor: accent }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-[#2f2860]/70 uppercase md:text-sm">
          Trilha
        </p>
        <div className="space-y-2.5">
          {["Funções", "Geometria", "Revisão"].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-2.5 rounded-lg border border-[#2f2860]/10 bg-white/55 px-3 py-2.5"
            >
              <div
                className={cn(
                  "size-3.5 rounded-full border",
                  i === 0
                    ? "border-[#5b4dff] bg-[#5b4dff]"
                    : "border-[#2f2860]/20",
                )}
              />
              <span className="text-[11px] font-medium text-[#2f2860]/80 md:text-xs">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col items-center justify-center p-5 md:p-6"
      style={{ backgroundColor: accent }}
    >
      <p className="text-4xl font-semibold tracking-tight text-[#12352b] sm:text-5xl md:text-6xl">
        68%
      </p>
      <p className="mt-1 text-[11px] font-medium tracking-[0.12em] text-[#12352b]/45 uppercase md:text-xs">
        média geral
      </p>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#12352b]/10">
        <div className="h-full w-[68%] rounded-full bg-[#12352b]" />
      </div>
    </div>
  );
}

export function LandingArcCarousel({
  variant = "section",
  className,
}: {
  variant?: "section" | "background";
  className?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const progressRef = useRef(0);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const speed = 1 / (LOOP_DURATION / CARD_COUNT);

    const onTick = (_time: number, deltaTime: number) => {
      progressRef.current += (deltaTime / 1000) * speed;
      setProgress(progressRef.current);
    };

    gsap.ticker.add(onTick);

    return () => {
      gsap.ticker.remove(onTick);
    };
  }, []);

  const isBackground = variant === "background";
  const isMobile = viewportWidth < 640;
  const layout = getResponsiveLayout(variant, viewportWidth);
  const visibleOffset = getVisibleOffset(viewportWidth, variant);
  const cardWidth = getCardWidth(variant, viewportWidth);
  const previewHeight = cardWidth * 0.58;
  const footerHeight = 44;
  const spreadX = viewportWidth * layout.spreadXFactor;
  const arcDepth = spreadX * 0.28;

  const visibleCards = PRODUCT_FEATURES.flatMap((feature, index) =>
    getCopyRange(index, progress, visibleOffset).map((copy) => ({
      feature,
      offset: index - progress + copy * CARD_COUNT,
      key: `${feature.id}::${copy}`,
    })),
  );

  return (
    <div
      className={cn(
        isBackground
          ? cn(
              "absolute inset-0 z-0 flex items-center justify-center overflow-hidden",
              isMobile && "translate-y-10",
            )
          : "relative left-1/2 mt-6 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip md:mt-4",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 rounded-[50%] border border-dashed",
          isBackground ? "border-white/10" : "border-black/[0.14]",
        )}
        style={{
          width: spreadX * 2,
          height: arcDepth * 2,
          transform: `translate(-50%, calc(-50% + ${arcDepth}px))`,
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative w-full",
          isBackground
            ? isMobile
              ? "h-[clamp(280px,46vh,520px)]"
              : "h-[clamp(360px,58vh,720px)]"
            : isMobile
              ? "h-[clamp(300px,52vw,400px)]"
              : "h-[clamp(300px,40vw,520px)]",
        )}
      >
        {visibleCards.map(({ feature, offset, key }) => {
          const transform = getCardTransform(offset, viewportWidth, layout);
          const cardOpacity = isBackground
            ? transform.opacity * 0.72
            : transform.opacity;

          const cardZIndex = isBackground
            ? Math.max(1, 4 - Math.round(Math.abs(offset)))
            : transform.zIndex;

          return (
            <article
              key={key}
              className="pointer-events-none absolute top-1/2 left-1/2 overflow-hidden rounded-sm border-2 border-black bg-white shadow-[0_28px_70px_rgba(0,0,0,0.14)] will-change-transform"
              style={{
                width: cardWidth,
                transform: `translate3d(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px), 0) rotate(${transform.rotate}deg) scale(${transform.scale})`,
                transformOrigin: "center center",
                opacity: cardOpacity,
                zIndex: cardZIndex,
              }}
            >
              <div style={{ height: previewHeight }}>
                <FeaturePreview type={feature.preview} accent={feature.accent} />
              </div>
              <div
                className="flex items-center border-t-2 border-black bg-[#1a1a1a] px-4"
                style={{ height: footerHeight }}
              >
                <p className="text-left text-xs font-medium text-white/90 md:text-sm">
                  {feature.title}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
