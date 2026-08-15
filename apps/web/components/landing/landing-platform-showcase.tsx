"use client";

import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Play,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

/**
 * Cole aqui a URL do vídeo do produto (mp4 ou embed) quando estiver pronto.
 * Ex.: "/videos/plataforma-demo.mp4"
 */
export const LANDING_PLATFORM_VIDEO_SRC = "";

const NAV_ITEMS = [
  { label: "Início", icon: LayoutDashboard, active: false },
  { label: "Simulados", icon: BookOpen, active: false },
  { label: "Progresso", icon: BarChart3, active: true },
  { label: "Tutor IA", icon: MessageSquare, active: false },
];

export function LandingPlatformShowcase() {
  const hasVideo = LANDING_PLATFORM_VIDEO_SRC.length > 0;

  return (
    <section
      id="plataforma"
      data-scroll-section
      className="relative bg-[#f3f3f1] px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-[#7c6cff] uppercase">
          ( A plataforma )
        </p>

        <h2 className="font-display mt-5 text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-[#0b1220]">
          Tudo em um só lugar
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#0b1220]/65 md:text-lg">
          Simulados, métricas, trilha e tutor IA reunidos num painel simples — para
          você estudar com direção, ver evolução e saber exatamente o que revisar
          em seguida.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-[1100px] md:mt-16">
        <div className="overflow-hidden rounded-2xl border-2 border-black bg-[#111111] shadow-[0_32px_80px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-[10px] tracking-wide text-white/35">
              enemplus.app / progresso
            </span>
          </div>

          <div className="flex min-h-[320px] flex-col md:min-h-[480px] md:flex-row">
            <aside className="hidden w-[220px] shrink-0 border-r border-white/10 bg-[#0d0d0d] p-4 md:block">
              <div className="flex items-center gap-2 px-2 py-1">
                <Sparkles className="size-4 text-[#b0ff57]" />
                <span className="text-sm font-semibold tracking-wide text-white">
                  ENEM+
                </span>
              </div>

              <nav className="mt-6 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                      item.active
                        ? "bg-white/10 font-medium text-white"
                        : "text-white/45"
                    }`}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.label}
                  </div>
                ))}
              </nav>
            </aside>

            <div className="relative flex flex-1 flex-col bg-[#141414]">
              <div className="border-b border-white/10 px-4 py-3 md:px-6">
                <p className="text-xs text-white/40">Progresso</p>
                <p className="mt-0.5 text-sm font-medium text-white/90">
                  Sua evolução no ENEM
                </p>
              </div>

              <div className="relative flex flex-1 items-center justify-center p-4 md:p-8">
                {hasVideo ? (
                  <video
                    className="h-full max-h-[360px] w-full rounded-xl border border-white/10 object-cover"
                    src={LANDING_PLATFORM_VIDEO_SRC}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <div className="relative flex aspect-video w-full max-w-3xl flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-[#1a1a1a]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,108,255,0.12),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(176,255,87,0.08),transparent_50%)]" />
                    <div className="relative flex size-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
                      <Play className="ml-1 size-7 text-white/80" fill="currentColor" />
                    </div>
                    <p className="relative mt-4 text-sm font-medium text-white/70">
                      Vídeo da plataforma em breve
                    </p>
                    <p className="relative mt-1 max-w-xs text-center text-xs text-white/35">
                      Defina a URL em{" "}
                      <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px]">
                        LANDING_PLATFORM_VIDEO_SRC
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl text-center md:mt-12">
        <p className="text-base leading-relaxed text-[#0b1220]/60 md:text-lg">
          Criamos o ENEM+ para você estudar com foco — menos volume, mais clareza
          sobre o que falta dominar.
        </p>

        <Link
          href="/tutor"
          className="mt-6 inline-flex rounded-full bg-[#6840ff] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#5a36e0]"
        >
          Conhecer a plataforma
        </Link>
      </div>
    </section>
  );
}
