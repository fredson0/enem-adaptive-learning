const DEFAULT_APP_PATH = "/tutor";

export function isGuestAllowedPath(pathname: string) {
  return pathname.startsWith("/tutor");
}

export function getLoginPath(next?: string | null): string {
  if (!next || !isSafeAppPath(next)) {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(next)}`;
}

export function getSafeRedirectPath(next?: string | null): string {
  if (!next || !isSafeAppPath(next)) {
    return DEFAULT_APP_PATH;
  }

  return next;
}

function isSafeAppPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/login") &&
    !path.startsWith("/api")
  );
}
