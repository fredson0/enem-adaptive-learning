/** Faixas da shutter — cinza frio (a taupe Osmo vai no fundo das seções). */
export const PAGE_TRANSITION_COLOR = "#d6d6d6";

/** Alturas relativas das faixas (veneziana irregular). */
export const PAGE_TRANSITION_SLATS = [8, 13, 5, 16, 7, 14, 6, 12, 9] as const;

/** Rotas do app logado — sem shutter. */
export function isWorkspacePath(pathname: string) {
  if (pathname.startsWith("/trilha-personalizada")) return false;
  if (pathname.startsWith("/tutor-ia")) return false;
  if (pathname === "/tutor" || pathname.startsWith("/tutor/")) return true;
  if (pathname === "/trilha" || pathname.startsWith("/trilha/")) return true;

  return ["/simulados", "/progresso", "/perfil", "/planos", "/onboarding"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Páginas públicas da vitrine onde a shutter pode animar (home + marketing). */
const VITRINE_TRANSITION_PREFIXES = [
  "/como-funciona",
  "/precos",
  "/tutor-ia",
  "/trilha-personalizada",
] as const;

export function isVitrineTransitionPath(pathname: string) {
  if (pathname === "/") return true;
  return VITRINE_TRANSITION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function shouldSkipPageTransition(from: string, to: string) {
  if (from === to) return true;
  if (isWorkspacePath(from) || isWorkspacePath(to)) return true;
  if (from.startsWith("/login") || to.startsWith("/login")) return true;
  if (from.startsWith("/onboarding") || to.startsWith("/onboarding")) return true;
  return !isVitrineTransitionPath(from) || !isVitrineTransitionPath(to);
}

export function normalizePath(url: URL) {
  return `${url.pathname}${url.search}`;
}

/** Força fechamento da shutter (ex.: redirect rápido após login). */
export function resetPageTransitionOverlay() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("page-transition:reset"));
}
