import { NextResponse } from "next/server";
import {
  applyAuthCookies,
  getAccessTokenFromCookies,
  nestFetch,
  rotateRefreshTokens,
} from "@/lib/auth-server";
import type { User } from "@/lib/auth";

export async function GET() {
  let accessToken = await getAccessTokenFromCookies();
  let rotated = null as Awaited<ReturnType<typeof rotateRefreshTokens>>;

  if (!accessToken) {
    rotated = await rotateRefreshTokens();
    accessToken = rotated?.accessToken ?? null;
  }

  if (!accessToken) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  let { data, status } = await nestFetch<User>("/usuarios/perfil", {
    method: "GET",
    accessToken,
  });

  if (status === 401) {
    rotated = await rotateRefreshTokens();
    if (!rotated) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    accessToken = rotated.accessToken;
    ({ data, status } = await nestFetch<User>("/usuarios/perfil", {
      method: "GET",
      accessToken,
    }));
  }

  if (status !== 200) {
    return NextResponse.json(
      { message: (data as { message?: string })?.message ?? "Erro ao obter perfil" },
      { status },
    );
  }

  const response = NextResponse.json(data);
  if (rotated) {
    applyAuthCookies(response, rotated);
  }
  return response;
}
