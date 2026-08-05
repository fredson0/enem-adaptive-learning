import { NextResponse } from "next/server";
import {
  applyAuthCookies,
  getAccessTokenFromCookies,
  nestFetch,
  rotateRefreshTokens,
} from "@/lib/auth-server";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context, "GET");
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context, "POST");
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context, "PATCH");
}

export async function PUT(request: Request, context: RouteContext) {
  return proxy(request, context, "PUT");
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context, "DELETE");
}

async function proxy(
  request: Request,
  context: RouteContext,
  method: string,
) {
  const { path } = await context.params;
  const nestPath = `/${path.join("/")}`;

  if (
    nestPath.startsWith("/usuarios/login-google") ||
    nestPath.startsWith("/usuarios/auth/")
  ) {
    return NextResponse.json({ message: "Use /api/auth/*" }, { status: 400 });
  }

  let accessToken = await getAccessTokenFromCookies();
  let rotated = null as Awaited<ReturnType<typeof rotateRefreshTokens>>;

  if (!accessToken) {
    rotated = await rotateRefreshTokens();
    accessToken = rotated?.accessToken ?? null;
  }

  if (!accessToken) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.search;
  const body =
    method === "GET" || method === "DELETE"
      ? undefined
      : await request.text();

  const run = (token: string) =>
    nestFetch<unknown>(`${nestPath}${search}`, {
      method,
      body,
      accessToken: token,
    });

  let { data, status } = await run(accessToken);

  if (status === 401) {
    rotated = await rotateRefreshTokens();
    if (!rotated) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    accessToken = rotated.accessToken;
    ({ data, status } = await run(accessToken));
  }

  if (status === 204) {
    const empty = new NextResponse(null, { status: 204 });
    return rotated ? applyAuthCookies(empty, rotated) : empty;
  }

  const response = NextResponse.json(data, { status });
  return rotated ? applyAuthCookies(response, rotated) : response;
}
