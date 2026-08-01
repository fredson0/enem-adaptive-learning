"use client";

import { ScrollingTicker } from "@/components/landing/scrolling-ticker";
import { SlideHoverButton } from "@/components/landing/slide-hover-button";
import gsap from "gsap";
import { Globe, Menu, Share2, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TICKER_GAP = 8;

const PRODUTO_LINKS = [
  { label: "Tutor IA", href: "#tutor" },
  { label: "Simulados Adaptativos", href: "#simulados" },
  { label: "Métricas de Proficiência", href: "#metricas" },
  { label: "Trilha Personalizada", href: "#trilha", badge: "NOVO" },
];

const EXPLORAR_LINKS = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Para Escolas Públicas", href: "#escolas" },
  { label: "Planos e Preços", href: "#planos" },
  { label: "Sobre o Projeto", href: "#sobre" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const navShellRef = useRef<HTMLDivElement>(null);
  const tickerOuterRef = useRef<HTMLDivElement>(null);
  const tickerInnerRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuInnerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const getTickerMetrics = () => {
    const tickerHeight = tickerInnerRef.current?.offsetHeight ?? 0;
    const travel = tickerHeight + TICKER_GAP + 6;

    return { tickerHeight, travel };
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );
    });

    return () => ctx.revert();
  }, []);

  const openMenu = () => {
    if (
      !containerRef.current ||
      !tickerOuterRef.current ||
      !tickerInnerRef.current ||
      !menuPanelRef.current ||
      !menuInnerRef.current
    ) {
      return;
    }

    setMenuOpen(true);
    timelineRef.current?.kill();

    const panelHeight = menuInnerRef.current.scrollHeight;
    const { tickerHeight, travel } = getTickerMetrics();

    timelineRef.current = gsap
      .timeline()
      .to(tickerInnerRef.current, {
        y: -travel,
        duration: 0.46,
        ease: "power3.inOut",
      })
      .to(
        tickerOuterRef.current,
        {
          marginTop: -tickerHeight,
          height: 0,
          opacity: 0,
          duration: 0.34,
          ease: "power3.inOut",
        },
        "-=0.34",
      )
      .to(
        containerRef.current,
        {
          maxWidth: "72rem",
          duration: 0.55,
          ease: "power3.inOut",
        },
        "-=0.1",
      )
      .to(
        menuPanelRef.current,
        {
          height: panelHeight,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
        },
        "-=0.2",
      )
      .fromTo(
        menuInnerRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.28",
      );
  };

  const closeMenu = () => {
    if (
      !containerRef.current ||
      !tickerOuterRef.current ||
      !tickerInnerRef.current ||
      !menuPanelRef.current ||
      !menuInnerRef.current
    ) {
      return;
    }

    timelineRef.current?.kill();

    const { tickerHeight, travel } = getTickerMetrics();

    timelineRef.current = gsap
      .timeline({
        onComplete: () => setMenuOpen(false),
      })
      .to(menuInnerRef.current, {
        y: 12,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      })
      .to(
        menuPanelRef.current,
        {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: "power3.inOut",
        },
        "-=0.05",
      )
      .to(
        containerRef.current,
        {
          maxWidth: "34rem",
          duration: 0.5,
          ease: "power3.inOut",
        },
        "-=0.15",
      )
      .set(tickerOuterRef.current, {
        height: tickerHeight,
        marginTop: -tickerHeight,
        opacity: 0,
      })
      .set(tickerInnerRef.current, { y: -travel })
      .to(tickerOuterRef.current, {
        marginTop: TICKER_GAP,
        opacity: 1,
        duration: 0.32,
        ease: "power3.out",
      })
      .to(
        tickerInnerRef.current,
        {
          y: 0,
          duration: 0.48,
          ease: "power3.out",
        },
        "-=0.28",
      );
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 pt-4 md:px-6">
      <div
        ref={containerRef}
        className="relative mx-auto w-full"
        style={{ maxWidth: "34rem" }}
      >
        <div
          ref={navShellRef}
          className="relative z-20 overflow-hidden rounded-[10px] border border-white/8 bg-[#12151c] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="relative flex items-center justify-between gap-3 px-3 py-2.5 md:px-4">
            <button
              type="button"
              onClick={toggleMenu}
              className="flex items-center gap-2 rounded-[6px] bg-[#1c212b] px-3.5 py-2 text-sm text-white/90 transition-colors hover:bg-[#252b38]"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? (
                <X className="size-3.5" strokeWidth={1.75} />
              ) : (
                <Menu className="size-3.5" strokeWidth={1.75} />
              )}
              Menu
            </button>

            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-base font-bold tracking-[0.2em] text-white uppercase md:text-lg"
            >
              ENEM+
            </Link>

            <div className="flex items-center gap-1.5">
              <SlideHoverButton
                href="/login"
                label="Login"
                className="hidden rounded-full bg-[#1c212b] text-white hover:bg-[#252b38] sm:inline-flex"
              />
              <SlideHoverButton
                href="#planos"
                label="Começar"
                className="rounded-[6px] bg-[#1e3a8a] text-white hover:bg-[#1d4ed8]"
              />
            </div>
          </div>
        </div>

        <div
          ref={tickerOuterRef}
          className="relative z-10 overflow-hidden will-change-[margin,height]"
          style={{ marginTop: TICKER_GAP }}
        >
          <div ref={tickerInnerRef} className="will-change-transform">
            <ScrollingTicker />
          </div>
        </div>

        <div
          ref={menuPanelRef}
          className="h-0 overflow-hidden opacity-0"
          aria-hidden={!menuOpen}
        >
          <div
            ref={menuInnerRef}
            className="rounded-[10px] border border-white/8 bg-[#12151c] p-4 md:p-5"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <section className="rounded-[10px] border border-white/8 bg-[#151a24] p-5 md:p-6">
                <p className="mb-5 font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase">
                  Nosso Produto
                </p>
                <ul className="space-y-3.5">
                  {PRODUTO_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="group flex items-center gap-2 text-base font-medium text-white/88 transition hover:text-white"
                      >
                        {link.label}
                        {link.badge && (
                          <span className="rounded-[4px] bg-[#1e3a8a] px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[10px] border border-white/8 bg-[#11151d] p-5 md:p-6">
                <p className="mb-5 font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase">
                  Explorar
                </p>
                <ul className="space-y-3.5">
                  {EXPLORAR_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="text-base font-medium text-white/85 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex gap-2">
                  {[Share2, Globe, Sparkles].map((Icon, index) => (
                    <button
                      key={index}
                      type="button"
                      className="flex size-9 items-center justify-center rounded-[6px] border border-white/10 bg-[#1a1f2a] text-white/65 transition hover:border-[#3b82f6]/40 hover:text-white"
                      aria-label="Rede social"
                    >
                      <Icon className="size-3.5" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[10px] border border-white/8 bg-[#0f141d] p-5 md:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase">
                    Comece
                  </span>
                  <span className="rounded-[4px] bg-[#1e3a8a] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
                    Aprendizado
                  </span>
                </div>

                <h3 className="max-w-xs text-2xl leading-tight font-semibold text-white md:text-3xl">
                  Sua preparação ENEM começa aqui
                </h3>

                <div className="relative mx-auto my-6 aspect-[4/3] w-full max-w-[220px]">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
                    alt="Estudantes estudando para o ENEM"
                    fill
                    className="rounded-[8px] object-cover ring-1 ring-white/10"
                  />
                </div>

                <Link
                  href="#planos"
                  onClick={closeMenu}
                  className="flex h-10 w-full items-center justify-center rounded-[6px] bg-white text-sm font-medium text-[#0b1220] transition hover:bg-white/92"
                >
                  Saiba mais
                </Link>
              </section>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 -z-10 bg-black/35 backdrop-blur-[2px]"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
