import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_SEC,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SEC,
  authCookieOptions,
  type AuthTokens,
} from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3333";

const API_UNAVAILABLE_MESSAGE =
  "API indisponível. Aguarde o backend iniciar (npm run dev:api) em http://127.0.0.1:3333.";

async function fetchApiWithRetry(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}

export function applyAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set(
    ACCESS_COOKIE,
    tokens.accessToken,
    authCookieOptions(ACCESS_MAX_AGE_SEC),
  );
  response.cookies.set(
    REFRESH_COOKIE,
    tokens.refreshToken,
    authCookieOptions(REFRESH_MAX_AGE_SEC),
  );
  return response;
}

export function clearAuthCookiesOn(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...authCookieOptions(0), maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...authCookieOptions(0), maxAge: 0 });
  return response;
}

export async function getAccessTokenFromCookies() {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshTokenFromCookies() {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value ?? null;
}

export async function nestFetch<T>(
  path: string,
  init: RequestInit & { accessToken?: string | null } = {},
): Promise<{ data: T; status: number }> {
  const { accessToken, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (
    !headers.has("Content-Type") &&
    rest.body &&
    typeof rest.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetchApiWithRetry(`${API_URL}${path}`, {
      ...rest,
      headers,
      cache: "no-store",
    });
  } catch {
    return {
      data: {
        message: API_UNAVAILABLE_MESSAGE,
      } as T,
      status: 503,
    };
  }

  if (response.status === 204) {
    return { data: undefined as T, status: 204 };
  }

  const data = (await response.json().catch(() => null)) as T;
  return { data, status: response.status };
}

/**
 * Renova access via refresh cookie. Retorna tokens novos ou null.
 * Caller deve aplicar cookies na Response HTTP.
 */
export async function rotateRefreshTokens(): Promise<AuthTokens | null> {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) return null;

  const { data, status } = await nestFetch<{
    accessToken: string;
    refreshToken: string;
  }>("/usuarios/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (status !== 200 || !data?.accessToken || !data?.refreshToken) {
    return null;
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}
