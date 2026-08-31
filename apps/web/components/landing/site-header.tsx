"use client";

import { ScrollingTicker } from "@/components/landing/scrolling-ticker";
import { SlideHoverButton } from "@/components/landing/slide-hover-button";
import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, Menu, Share2, Sparkles, X } from "lucide-react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

const HEADER_LOGO_CLASS =
  "font-display text-[1.85rem] leading-none font-black tracking-[-0.08em] text-white uppercase sm:text-[2.15rem] md:text-[2.4rem]";

const NAV_LINKS = [
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Planos", href: "/precos" },
  { label: "Tutor IA", href: "/tutor-ia" },
  { label: "Trilha", href: "/trilha-personalizada" },
];

const PRODUTO_LINKS = [
  { label: "Tutor IA", href: "/tutor-ia" },
  { label: "Simulados Adaptativos", href: "/como-funciona" },
  { label: "Métricas de Proficiência", href: "/como-funciona" },
  { label: "Trilha Personalizada", href: "/trilha-personalizada", badge: "NOVO" },
];

const EXPLORAR_LINKS = [
  { label: "Como Funciona", href: "/como-funciona" },
  { label: "Para Escolas Públicas", href: "/precos" },
  { label: "Planos e Preços", href: "/precos" },
  { label: "Sobre o Projeto", href: "/como-funciona" },
];

type HeaderMorph = {
  detach: number;
  compact: number;
};

const COMPACT_MAX = 34;
const MENU_MAX = 72;
const HEADER_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

function morphFromScrollY(y: number): HeaderMorph {
  return {
    detach: Math.min(Math.max((y - 10) / 72, 0), 1),
    compact: Math.min(Math.max((y - 72) / 112, 0), 1),
  };
}

function readScrollMorph(getScrollY: () => number) {
  return morphFromScrollY(getScrollY());
}

function getScrollMaxWidthRem(compact: number) {
  if (compact < 0.01) return null;
  return lerp(56, COMPACT_MAX, compact);
}

function morphEquals(a: HeaderMorph, b: HeaderMorph) {
  return a.detach === b.detach && a.compact === b.compact;
}

function useHeaderMorph(
  menuActive: boolean,
  getScrollY: () => number,
) {
  const [morph, setMorph] = useState<HeaderMorph>({ detach: 0, compact: 0 });
  const morphRef = useRef<HeaderMorph>({ detach: 0, compact: 0 });

  const syncFromScroll = useCallback(() => {
    const next = readScrollMorph(getScrollY);
    const prev = morphRef.current;
    if (morphEquals(prev, next)) {
      return prev;
    }
    morphRef.current = next;
    setMorph(next);
    return next;
  }, [getScrollY]);

  const restoreMorph = useCallback((next: HeaderMorph) => {
    if (morphEquals(morphRef.current, next)) {
      return;
    }
    morphRef.current = next;
    setMorph(next);
  }, []);

  useEffect(() => {
    const update = () => {
      if (menuActive) return;
      syncFromScroll();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [menuActive, syncFromScroll]);

  return { morph, morphRef, syncFromScroll, restoreMorph };
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

function getTargetWidthRem(scrollMorph: HeaderMorph, viewportWidth: number) {
  const rem = getScrollMaxWidthRem(scrollMorph.compact);
  if (rem === null) return viewportWidth / 16;
  return rem;
}

type MenuVisualState = {
  widthRem: number;
  detach: number;
  compact: number;
};

export function SiteHeader({
  variant = "landing",
  revealed = true,
}: {
  variant?: "landing" | "auth";
  revealed?: boolean;
}) {
  const isAuth = variant === "auth";
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false);

  const getScrollY = useCallback(
    () => lenis?.scroll ?? window.scrollY,
    [lenis],
  );

  const { morph, morphRef, syncFromScroll, restoreMorph } = useHeaderMorph(
    menuActive,
    getScrollY,
  );

  const headerRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navShellRef = useRef<HTMLDivElement>(null);
  const tickerOuterRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuInnerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const menuVisualRef = useRef<MenuVisualState | null>(null);
  const layoutAtOpenRef = useRef<HeaderMorph | null>(null);
  const widthAtOpenRef = useRef<number | null>(null);

  const getRestMorph = () =>
    isAuth ? AUTH_HEADER_MORPH : readScrollMorph(getScrollY);

  const setMenuVisual = (next: MenuVisualState | null) => {
    menuVisualRef.current = next;
  };

  const applyVisualToDom = (visual: MenuVisualState) => {
    if (containerRef.current) {
      containerRef.current.style.maxWidth = `${visual.widthRem}rem`;
    }
    if (headerRef.current) {
      headerRef.current.style.paddingTop = `${lerp(0, 16, visual.detach)}px`;
      headerRef.current.style.paddingLeft = `${lerp(0, 16, visual.compact)}px`;
      headerRef.current.style.paddingRight = `${lerp(0, 16, visual.compact)}px`;
    }
  };

  useEffect(() => {
    if (!isAuth) return;

    setMenuOpen(false);
    setMenuActive(false);
    setMenuVisual(null);
    layoutAtOpenRef.current = null;
    widthAtOpenRef.current = null;
  }, [isAuth]);

  useEffect(() => {
    if (!lenis || menuActive) return;

    const onLenisScroll = () => {
      syncFromScroll();
    };

    lenis.on("scroll", onLenisScroll);
    return () => {
      lenis.off("scroll", onLenisScroll);
    };
  }, [lenis, menuActive, syncFromScroll]);

  useLayoutEffect(() => {
    if (isAuth) return;
    syncFromScroll();
  }, [isAuth, syncFromScroll]);

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

    const startMorph = getRestMorph();
    morphRef.current = startMorph;
    layoutAtOpenRef.current = startMorph;
    widthAtOpenRef.current =
      containerRef.current.getBoundingClientRect().width / 16;

    const currentWidthRem = widthAtOpenRef.current;
    const needsCompactFirst =
      !isAuth && currentWidthRem > COMPACT_MAX + 0.75;
    const panelHeight = menuInnerRef.current.scrollHeight;

    const initialVisual: MenuVisualState = {
      widthRem: currentWidthRem,
      detach: startMorph.detach,
      compact: startMorph.compact,
    };

    flushSync(() => {
      restoreMorph(startMorph);
      setMenuVisual(initialVisual);
      setMenuActive(true);
      setMenuOpen(true);
    });

    const animState = {
      detach: startMorph.detach,
      compact: startMorph.compact,
      widthRem: currentWidthRem,
      panelHeight: 0,
      panelOpacity: 0,
      innerY: -10,
      innerOpacity: 0,
      innerScale: 0.98,
    };

    const updatePanelStyles = () => {
      if (menuPanelRef.current) {
        menuPanelRef.current.style.height = `${animState.panelHeight}px`;
        menuPanelRef.current.style.opacity = String(animState.panelOpacity);
      }
      if (menuInnerRef.current) {
        menuInnerRef.current.style.opacity = String(animState.innerOpacity);
        menuInnerRef.current.style.transform = `translateY(${animState.innerY}px) scaleY(${animState.innerScale})`;
      }
    };

    const applyMenuMorph = () => {
      const next: MenuVisualState = {
        widthRem: animState.widthRem,
        detach: animState.detach,
        compact: animState.compact,
      };
      setMenuVisual(next);
      applyVisualToDom(next);
    };

    updatePanelStyles();

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
      panelHeight,
      panelOpacity: 1,
      innerY: 0,
      innerOpacity: 1,
      innerScale: 1,
      duration: 0.46,
      ease: "power3.out",
      onUpdate: updatePanelStyles,
    });

    tl.to(
      animState,
      {
        widthRem: MENU_MAX,
        duration: 0.4,
        ease: "power3.inOut",
        onUpdate: applyMenuMorph,
      },
      "+=0.02",
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

    const targetMorph =
      layoutAtOpenRef.current ?? (isAuth ? AUTH_HEADER_MORPH : getRestMorph());
    morphRef.current = targetMorph;

    const viewportWidth =
      headerRef.current?.clientWidth ?? window.innerWidth;
    const targetWidthRem =
      widthAtOpenRef.current ??
      (isAuth ? COMPACT_MAX : getTargetWidthRem(targetMorph, viewportWidth));

    const startVisual = menuVisualRef.current ?? {
      widthRem: containerRef.current.getBoundingClientRect().width / 16,
      detach: targetMorph.detach,
      compact: targetMorph.compact,
    };

    const animState = {
      detach: startVisual.detach,
      compact: startVisual.compact,
      widthRem: startVisual.widthRem,
      panelHeight: menuPanelRef.current.offsetHeight,
      panelOpacity: 1,
      innerY: 0,
      innerOpacity: 1,
      innerScale: 1,
    };

    const updatePanelStyles = () => {
      if (menuPanelRef.current) {
        menuPanelRef.current.style.height = `${animState.panelHeight}px`;
        menuPanelRef.current.style.opacity = String(animState.panelOpacity);
      }
      if (menuInnerRef.current) {
        menuInnerRef.current.style.opacity = String(animState.innerOpacity);
        menuInnerRef.current.style.transform = `translateY(${animState.innerY}px) scaleY(${animState.innerScale})`;
      }
    };

    const applyCloseMorph = () => {
      const next: MenuVisualState = {
        widthRem: animState.widthRem,
        detach: animState.detach,
        compact: animState.compact,
      };
      setMenuVisual(next);
      applyVisualToDom(next);
    };

    const tl = gsap.timeline({
      onComplete: () => {
        const restoreMorphValue =
          layoutAtOpenRef.current ??
          (isAuth ? AUTH_HEADER_MORPH : morphRef.current);

        flushSync(() => {
          restoreMorph(
            isAuth ? AUTH_HEADER_MORPH : restoreMorphValue,
          );
          setMenuOpen(false);
          setMenuActive(false);
          setMenuVisual(null);
          layoutAtOpenRef.current = null;
          widthAtOpenRef.current = null;
        });

        if (menuPanelRef.current) {
          menuPanelRef.current.style.height = "";
          menuPanelRef.current.style.opacity = "";
        }
        if (menuInnerRef.current) {
          menuInnerRef.current.style.opacity = "";
          menuInnerRef.current.style.transform = "";
        }
      },
    });

    tl.to(animState, {
      innerY: -10,
      innerOpacity: 0,
      innerScale: 0.98,
      duration: 0.22,
      ease: "power2.in",
      onUpdate: updatePanelStyles,
    }).to(
      animState,
      {
        panelHeight: 0,
        panelOpacity: 0,
        duration: 0.34,
        ease: "power3.in",
        onUpdate: updatePanelStyles,
      },
      "-=0.06",
    );

    tl.to(animState, {
      widthRem: targetWidthRem,
      detach: targetMorph.detach,
      compact: targetMorph.compact,
      duration: 0.42,
      ease: "power3.inOut",
      onUpdate: applyCloseMorph,
    });

    timelineRef.current = tl;
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  };

  const layoutMorph = menuOpen
    ? (layoutAtOpenRef.current ?? morph)
    : morph;

  const visual = menuOpen ? menuVisualRef.current : null;

  const showNavLinks = !isAuth && layoutMorph.compact < 0.45 && !menuOpen;
  const showLogo = isAuth || layoutMorph.compact > 0.2 || menuOpen;
  const showTicker = !isAuth && layoutMorph.compact < 0.2 && !menuOpen;
  const useCompactShell = isAuth || layoutMorph.detach > 0.08 || menuOpen;

  const containerMaxWidth = visual
    ? `${visual.widthRem}rem`
    : isAuth
      ? `${COMPACT_MAX}rem`
      : getScrollMaxWidth(morph.compact);

  const headerPaddingTop = visual
    ? lerp(0, 16, visual.detach)
    : lerp(0, 16, morph.detach);
  const headerPaddingX = visual
    ? lerp(0, 16, visual.compact)
    : lerp(0, 16, morph.compact);

  const useCssWidthTransition = !menuOpen;
  const showChrome = revealed || reduceMotion === true;

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
      <motion.div
        ref={containerRef}
        className={cn(
          "pointer-events-auto relative w-full",
          useCssWidthTransition && "transition-[max-width] duration-500 ease-out",
          !showChrome && "pointer-events-none",
        )}
        style={{ maxWidth: containerMaxWidth }}
        initial={false}
        animate={
          showChrome
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: -28, filter: "blur(14px)" }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.85, ease: HEADER_REVEAL_EASE }
        }
      >
        <div
          ref={navShellRef}
          className={cn(
            "relative z-20 overflow-hidden transition-[border-radius,padding] duration-500 ease-out",
            useCompactShell
              ? "rounded-xl border border-white/10"
              : "rounded-b-2xl md:rounded-b-3xl",
          )}
          style={{ backgroundColor: MARKETING_OSMO_COLORS.osmoHeader }}
        >
          <div
            className="relative flex items-center justify-between gap-3 transition-[padding] duration-500 ease-out"
            style={{
              padding: useCompactShell
                ? "12px 16px"
                : `${lerp(12, 10, layoutMorph.compact)}px ${lerp(24, 14, layoutMorph.compact)}px`,
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
                  key={link.label}
                  href={resolveNavHref(link.href, isAuth)}
                  className="text-xs text-[#E1E0CC]/75 transition-colors hover:text-[#E1E0CC] lg:text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden",
                HEADER_LOGO_CLASS,
              )}
            >
              ENEM+
            </Link>

            <Link
              href="/"
              className={cn(
                "absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ease-out md:block",
                HEADER_LOGO_CLASS,
                showLogo
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0",
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
                data-no-transition="true"
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

          <div
            ref={menuPanelRef}
            className="h-0 overflow-hidden opacity-0"
            style={{ transformOrigin: "top center" }}
            aria-hidden={!menuOpen}
          >
            <div
              ref={menuInnerRef}
              className="border-t border-white/10 px-4 pt-4 pb-4 md:px-5 md:pt-5 md:pb-5"
              style={{ transformOrigin: "top center" }}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5 md:p-6">
                  <p className="mb-5 font-mono text-[10px] tracking-[0.24em] text-[#E1E0CC]/40 uppercase">
                    Nosso Produto
                  </p>
                  <ul className="space-y-3.5">
                    {PRODUTO_LINKS.map((link) => (
                      <li key={link.label}>
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
                      <li key={link.label}>
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
      </motion.div>

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
