import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isGuestAllowedPath } from "./lib/login-redirect";

const PUBLIC_PATHS = ["/", "/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname) || isGuestAllowedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("enem_access_token")?.value;

  if (!token && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    !token &&
    pathname.match(/^\/(simulados|trilha|progresso|perfil|planos)/)
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
