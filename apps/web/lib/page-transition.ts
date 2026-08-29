/** Faixas da shutter — cinza frio (a taupe Osmo vai no fundo das seções). */
export const PAGE_TRANSITION_COLOR = "#d6d6d6";

/** Alturas relativas das faixas (veneziana irregular). */
export const PAGE_TRANSITION_SLATS = [8, 13, 5, 16, 7, 14, 6, 12, 9] as const;

export function isWorkspacePath(pathname: string) {
  if (pathname.startsWith("/trilha-personalizada")) return false;
  if (pathname.startsWith("/tutor-ia")) return false;
  if (pathname === "/tutor" || pathname.startsWith("/tutor/")) return true;
  if (pathname === "/trilha" || pathname.startsWith("/trilha/")) return true;

  return ["/simulados", "/progresso", "/perfil", "/planos", "/onboarding"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function shouldSkipPageTransition(from: string, to: string) {
  if (from === to) return true;
  return isWorkspacePath(from) && isWorkspacePath(to);
}

export function normalizePath(url: URL) {
  return `${url.pathname}${url.search}`;
}
