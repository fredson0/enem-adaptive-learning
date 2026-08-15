"use client";

import { ScrollingTicker } from "@/components/landing/scrolling-ticker";
import { SlideHoverButton } from "@/components/landing/slide-hover-button";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { Globe, Menu, Share2, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "Tutor IA", href: "#tutor" },
  { label: "Trilha", href: "#trilha" },
];

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

type HeaderMorph = {
  detach: number;
  compact: number;
};

const COMPACT_MAX = 34;
const MENU_MAX = 72;

function readScrollMorph(): HeaderMorph {
  const y = window.scrollY;
  return {
    detach: Math.min(Math.max((y - 10) / 72, 0), 1),
    compact: Math.min(Math.max((y - 72) / 112, 0), 1),
  };
}

function getScrollMaxWidthRem(compact: number) {
  if (compact < 0.01) return null;
  return lerp(56, COMPACT_MAX, compact);
}

function useHeaderMorph(menuActive: boolean) {
  const [morph, setMorph] = useState<HeaderMorph>({ detach: 0, compact: 0 });
  const morphRef = useRef<HeaderMorph>({ detach: 0, compact: 0 });

  const syncFromScroll = () => {
    const next = readScrollMorph();
    morphRef.current = next;
    setMorph(next);
    return next;
  };

  useEffect(() => {
    const update = () => {
      if (menuActive) return;
      syncFromScroll();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [menuActive]);

  return { morph, morphRef, syncFromScroll };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const AUTH_HEADER_MORPH: HeaderMorph = { detach: 1, compact: 1 };

function resolveNavHref(href: string, useHomeAnchors: boolean) {
  if (useHomeAnchors && href.startsWith("#")) {
    return `/${href}`;
  }

  return href;
}

function getScrollMaxWidth(compact: number) {
  const rem = getScrollMaxWidthRem(compact);
  if (rem === null) return "100%";
  return `${rem}rem`;
}

function getTargetWidthRem(
  scrollMorph: HeaderMorph,
  viewportWidth: number,
) {
  const rem = getScrollMaxWidthRem(scrollMorph.compact);
  if (rem === null) return viewportWidth / 16;
  return rem;
}

export function SiteHeader({ variant = "landing" }: { variant?: "landing" | "auth" }) {
  const isAuth = variant === "auth";
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [menuMorph, setMenuMorph] = useState<HeaderMorph | null>(null);
  const [menuWidthRem, setMenuWidthRem] = useState<number | null>(null);

  const { morph, morphRef, syncFromScroll } = useHeaderMorph(menuActive);

  const headerRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navShellRef = useRef<HTMLDivElement>(null);
  const tickerOuterRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuInnerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const getRestMorph = () => (isAuth ? AUTH_HEADER_MORPH : readScrollMorph());

  const activeMorph = isAuth
    ? (menuMorph ?? AUTH_HEADER_MORPH)
    : (menuMorph ?? morph);

  useEffect(() => {
    if (!isAuth) return;

    setMenuOpen(false);
    setMenuActive(false);
    setMenuMorph(null);
    setMenuWidthRem(null);
  }, [isAuth]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );
    });

    return () => ctx.revert();
  }, []);

  const pinContainerWidth = () => {
    const el = containerRef.current;
    if (!el) return;
    gsap.set(el, { maxWidth: el.getBoundingClientRect().width });
  };

  const openMenu = () => {
    if (
      !containerRef.current ||
      !menuPanelRef.current ||
      !menuInnerRef.current ||
      !headerRef.current
    ) {
      return;
    }

    timelineRef.current?.kill();
    pinContainerWidth();

    setMenuOpen(true);
    setMenuActive(true);

    const startMorph = getRestMorph();
    morphRef.current = startMorph;
    const needsCompactFirst = !isAuth && startMorph.compact < 0.55;
    const panelHeight = menuInnerRef.current.scrollHeight;
    const currentWidthRem =
      containerRef.current.getBoundingClientRect().width / 16;

    const animState = {
      detach: startMorph.detach,
      compact: startMorph.compact,
      widthRem: currentWidthRem,
      panelHeight: 0,
      panelOpacity: 0,
      innerY: 12,
      innerOpacity: 0,
    };

    const applyMenuMorph = () => {
      setMenuMorph({ detach: animState.detach, compact: animState.compact });
      setMenuWidthRem(animState.widthRem);
    };

    applyMenuMorph();

    const tl = gsap.timeline();

    if (needsCompactFirst) {
      tl.to(animState, {
        detach: 1,
        compact: 1,
        widthRem: COMPACT_MAX,
        duration: 0.48,
        ease: "power3.inOut",
        onUpdate: applyMenuMorph,
      });
    }

    tl.to(animState, {
      widthRem: MENU_MAX,
      duration: 0.42,
      ease: "power3.inOut",
      onUpdate: applyMenuMorph,
    })
      .to(
        animState,
        {
          panelHeight,
          panelOpacity: 1,
          innerY: 0,
          innerOpacity: 1,
          duration: 0.4,
          ease: "power3.out",
          onUpdate: () => {
            if (menuPanelRef.current) {
              menuPanelRef.current.style.height = `${animState.panelHeight}px`;
              menuPanelRef.current.style.opacity = String(animState.panelOpacity);
            }
            if (menuInnerRef.current) {
              menuInnerRef.current.style.opacity = String(animState.innerOpacity);
              menuInnerRef.current.style.transform = `translateY(${animState.innerY}px)`;
            }
          },
        },
        "-=0.22",
      );

    timelineRef.current = tl;
  };

  const closeMenu = () => {
    if (
      !containerRef.current ||
      !menuPanelRef.current ||
      !menuInnerRef.current
    ) {
      return;
    }

    timelineRef.current?.kill();

    const targetMorph = getRestMorph();
    morphRef.current = targetMorph;

    const viewportWidth =
      headerRef.current?.clientWidth ?? window.innerWidth;
    const targetWidthRem = isAuth
      ? COMPACT_MAX
      : getTargetWidthRem(targetMorph, viewportWidth);

    const animState = {
      detach: menuMorph?.detach ?? targetMorph.detach,
      compact: menuMorph?.compact ?? targetMorph.compact,
      widthRem: menuWidthRem ?? MENU_MAX,
      panelHeight: menuPanelRef.current.offsetHeight,
      panelOpacity: 1,
      innerY: 0,
      innerOpacity: 1,
    };

    const applyCloseMorph = () => {
      setMenuMorph({ detach: animState.detach, compact: animState.compact });
      setMenuWidthRem(animState.widthRem);
    };

    const tl = gsap.timeline({
      onComplete: () => {
        if (!isAuth) {
          syncFromScroll();
        } else {
          morphRef.current = AUTH_HEADER_MORPH;
        }

        setMenuOpen(false);
        setMenuActive(false);
        setMenuMorph(null);
        setMenuWidthRem(null);
        gsap.set(containerRef.current, { clearProps: "maxWidth" });
        gsap.set(menuPanelRef.current, { clearProps: "height,opacity" });
        gsap.set(menuInnerRef.current, { clearProps: "opacity,transform" });
      },
    });

    tl.to(animState, {
      innerY: 8,
      innerOpacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onUpdate: () => {
        if (menuInnerRef.current) {
          menuInnerRef.current.style.opacity = String(animState.innerOpacity);
          menuInnerRef.current.style.transform = `translateY(${animState.innerY}px)`;
        }
      },
    })
      .to(
        animState,
        {
          panelHeight: 0,
          panelOpacity: 0,
          duration: 0.3,
          ease: "power3.inOut",
          onUpdate: () => {
            if (menuPanelRef.current) {
              menuPanelRef.current.style.height = `${animState.panelHeight}px`;
              menuPanelRef.current.style.opacity = String(animState.panelOpacity);
            }
          },
        },
        "-=0.05",
      )
      .to(
        animState,
        {
          widthRem: targetWidthRem,
          detach: targetMorph.detach,
          compact: targetMorph.compact,
          duration: 0.4,
          ease: "power3.inOut",
          onUpdate: applyCloseMorph,
        },
        "-=0.1",
      );

    timelineRef.current = tl;
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  };

  const showNavLinks = !isAuth && activeMorph.compact < 0.45 && !menuOpen;
  const showLogo = isAuth || activeMorph.compact > 0.2 || menuOpen;
  const showTicker = !isAuth && activeMorph.compact < 0.2 && !menuOpen;
  const useCompactShell = isAuth || activeMorph.detach > 0.08 || menuOpen;

  const containerMaxWidth = menuWidthRem
    ? `${menuWidthRem}rem`
    : isAuth
      ? `${COMPACT_MAX}rem`
      : getScrollMaxWidth(morph.compact);

  const headerPaddingTop = lerp(0, 16, activeMorph.detach);
  const headerPaddingX = lerp(0, 16, activeMorph.compact);

  const useCssWidthTransition = !menuActive;

  return (
    <header
      ref={headerRef}
      className={cn(
        "pointer-events-none fixed top-0 right-0 left-0 z-50 flex justify-center",
        useCssWidthTransition && "transition-[padding] duration-500 ease-out",
      )}
      style={{
        paddingTop: headerPaddingTop,
        paddingLeft: headerPaddingX,
        paddingRight: headerPaddingX,
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "pointer-events-auto relative w-full",
          useCssWidthTransition && "transition-[max-width] duration-500 ease-out",
        )}
        style={{ maxWidth: containerMaxWidth }}
      >
        <div
          ref={navShellRef}
          className={cn(
            "relative z-20 overflow-hidden bg-black transition-[border-radius,padding] duration-500 ease-out",
            useCompactShell
              ? "rounded-xl border border-white/10"
              : "rounded-b-2xl md:rounded-b-3xl",
          )}
        >
          <div
            className="relative flex items-center justify-between gap-3 transition-[padding] duration-500 ease-out"
            style={{
              padding: useCompactShell
                ? "10px 16px"
                : `${lerp(10, 8, activeMorph.compact)}px ${lerp(24, 14, activeMorph.compact)}px`,
            }}
          >
            <button
              type="button"
              onClick={toggleMenu}
              className="flex items-center gap-2 text-xs text-[#E1E0CC]/80 transition-colors hover:text-[#E1E0CC] sm:text-sm"
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

            <nav
              className={cn(
                "absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 transition-all duration-500 ease-out md:flex lg:gap-10",
                showNavLinks
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0",
              )}
              aria-hidden={!showNavLinks}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={resolveNavHref(link.href, isAuth)}
                  className="text-xs text-[#E1E0CC]/75 transition-colors hover:text-[#E1E0CC] lg:text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold tracking-[0.18em] text-[#E1E0CC] uppercase md:hidden"
            >
              ENEM+
            </Link>

            <Link
              href="/"
              className={cn(
                "absolute left-1/2 hidden -translate-x-1/2 text-base font-semibold tracking-[0.18em] text-[#E1E0CC] uppercase transition-all duration-500 ease-out md:block",
                showLogo
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0",
              )}
              aria-hidden={!showLogo}
            >
              ENEM+
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <SlideHoverButton
                href="/login"
                label="Login"
                className={cn(
                  "hidden h-9 rounded-full px-4 text-xs text-[#E1E0CC]/80 hover:text-[#E1E0CC] sm:inline-flex sm:text-sm",
                  useCompactShell &&
                    "rounded-lg border border-white/15 bg-white/[0.08] px-4 hover:bg-white/[0.12]",
                )}
              />
              <Link
                href="/tutor"
                className={cn(
                  "inline-flex h-9 items-center bg-[#b0ff57] px-4 text-xs font-medium text-black transition hover:bg-[#c4ff7a] sm:text-sm",
                  useCompactShell ? "rounded-lg" : "rounded-full",
                )}
              >
                Começar
              </Link>
            </div>
          </div>
        </div>

        <div
          ref={tickerOuterRef}
          className={cn(
            "overflow-hidden transition-all duration-500 ease-out",
            showTicker
              ? "mt-2 max-h-12 opacity-100"
              : "mt-0 max-h-0 opacity-0",
          )}
          aria-hidden={!showTicker}
        >
          <ScrollingTicker variant="landing" />
        </div>

        <div
          ref={menuPanelRef}
          className="h-0 overflow-hidden opacity-0"
          aria-hidden={!menuOpen}
        >
          <div
            ref={menuInnerRef}
            className={cn(
              "border border-t-0 border-white/10 bg-black p-4 md:p-5",
              useCompactShell ? "rounded-b-xl" : "rounded-b-2xl md:rounded-b-3xl",
            )}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5 md:p-6">
                <p className="mb-5 font-mono text-[10px] tracking-[0.24em] text-[#E1E0CC]/40 uppercase">
                  Nosso Produto
                </p>
                <ul className="space-y-3.5">
                  {PRODUTO_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={resolveNavHref(link.href, isAuth)}
                        onClick={closeMenu}
                        className="group flex items-center gap-2 text-base font-medium text-[#E1E0CC]/85 transition hover:text-[#E1E0CC]"
                      >
                        {link.label}
                        {link.badge && (
                          <span className="rounded-full bg-[#b0ff57] px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-black uppercase">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-white/8 bg-white/[0.02] p-5 md:p-6">
                <p className="mb-5 font-mono text-[10px] tracking-[0.24em] text-[#E1E0CC]/40 uppercase">
                  Explorar
                </p>
                <ul className="space-y-3.5">
                  {EXPLORAR_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={resolveNavHref(link.href, isAuth)}
                        onClick={closeMenu}
                        className="text-base font-medium text-[#E1E0CC]/80 transition hover:text-[#E1E0CC]"
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
                      className="flex size-9 items-center justify-center rounded-full border border-white/10 text-[#E1E0CC]/55 transition hover:border-white/20 hover:text-[#E1E0CC]"
                      aria-label="Rede social"
                    >
                      <Icon className="size-3.5" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] p-5 md:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-[#E1E0CC]/40 uppercase">
                    Comece
                  </span>
                  <span className="rounded-full bg-[#b0ff57] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-black uppercase">
                    Aprendizado
                  </span>
                </div>

                <h3 className="max-w-xs text-2xl leading-tight font-medium text-[#E1E0CC] md:text-3xl">
                  Sua preparação ENEM começa aqui
                </h3>

                <div className="relative mx-auto my-6 aspect-[4/3] w-full max-w-[220px]">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
                    alt="Estudantes estudando para o ENEM"
                    fill
                    sizes="(max-width: 768px) 100vw, 220px"
                    className="rounded-lg object-cover ring-1 ring-white/10"
                  />
                </div>

                <Link
                  href="/tutor"
                  onClick={closeMenu}
                  className="flex h-10 w-full items-center justify-center rounded-full bg-[#b0ff57] text-sm font-medium text-black transition hover:bg-[#c4ff7a]"
                >
                  Começar agora
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
          className="pointer-events-auto fixed inset-0 -z-10 bg-black/40 backdrop-blur-[2px]"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
