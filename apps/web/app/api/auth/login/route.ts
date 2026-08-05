import { NextResponse } from "next/server";
import {
  applyAuthCookies,
  clearAuthCookiesOn,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  nestFetch,
} from "@/lib/auth-server";
import type { User } from "@/lib/auth";

type LoginBody = { idToken?: string };

/**
 * BFF: valida idToken no Nest, seta cookies HttpOnly no domínio do Next.
 * O browser NUNCA recebe access/refresh tokens no JSON.
 */
export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "Body inválido" }, { status: 400 });
  }

  if (!body.idToken) {
    return NextResponse.json({ message: "idToken obrigatório" }, { status: 400 });
  }

  const { data, status } = await nestFetch<{
    accessToken: string;
    refreshToken: string;
    user: User;
    message?: string;
  }>("/usuarios/login-google", {
    method: "POST",
    body: JSON.stringify({ idToken: body.idToken }),
  });

  if (status !== 200 && status !== 201) {
    return NextResponse.json(
      { message: data?.message ?? "Falha no login Google" },
      { status },
    );
  }

  const response = NextResponse.json({ user: data.user });
  return applyAuthCookies(response, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
}

export async function DELETE() {
  const refreshToken = await getRefreshTokenFromCookies();
  const accessToken = await getAccessTokenFromCookies();

  if (refreshToken) {
    await nestFetch("/usuarios/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      accessToken,
    });
  }

  return clearAuthCookiesOn(new NextResponse(null, { status: 204 }));
}
