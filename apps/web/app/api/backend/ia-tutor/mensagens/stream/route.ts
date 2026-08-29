import { NextResponse } from "next/server";
import {
  applyAuthCookies,
  getAccessTokenFromCookies,
  rotateRefreshTokens,
} from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3333";

async function proxyStream(body: string, accessToken: string) {
  return fetch(`${API_URL}/ia-tutor/mensagens/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Accept: "text/event-stream",
    },
    body,
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  let accessToken = await getAccessTokenFromCookies();
  let rotated = null as Awaited<ReturnType<typeof rotateRefreshTokens>>;

  if (!accessToken) {
    rotated = await rotateRefreshTokens();
    accessToken = rotated?.accessToken ?? null;
  }

  if (!accessToken) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  let upstream = await proxyStream(body, accessToken);

  if (upstream.status === 401) {
    rotated = await rotateRefreshTokens();
    if (!rotated) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    accessToken = rotated.accessToken;
    upstream = await proxyStream(body, accessToken);
  }

  if (!upstream.ok || !upstream.body) {
    const data = await upstream.json().catch(() => null);
    const response = NextResponse.json(
      (data as { message?: string }) ?? { message: "Erro na API" },
      { status: upstream.status },
    );
    return rotated ? applyAuthCookies(response, rotated) : response;
  }

  const headers = new Headers();
  headers.set("Content-Type", "text/event-stream; charset=utf-8");
  headers.set("Cache-Control", "no-cache, no-transform");
  headers.set("Connection", "keep-alive");

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });

  return rotated ? applyAuthCookies(response, rotated) : response;
}
