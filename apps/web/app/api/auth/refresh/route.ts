import { NextResponse } from "next/server";
import {
  applyAuthCookies,
  clearAuthCookiesOn,
  rotateRefreshTokens,
} from "@/lib/auth-server";

export async function POST() {
  const tokens = await rotateRefreshTokens();

  if (!tokens) {
    return clearAuthCookiesOn(
      NextResponse.json({ message: "Refresh inválido" }, { status: 401 }),
    );
  }

  return applyAuthCookies(NextResponse.json({ ok: true }), tokens);
}
