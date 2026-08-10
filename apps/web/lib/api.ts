export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Se true, chama Nest via BFF /api/backend (cookie HttpOnly → Bearer). */
  auth?: boolean;
  /** Evita duplo envio em POST (ex.: resposta de simulado). */
  idempotencyKey?: string;
};

/**
 * Cliente HTTP do browser.
 * - Rotas públicas Nest: auth=false → NEXT_PUBLIC_API_URL (só se necessário)
 * - Rotas autenticadas: auth=true (padrão) → /api/backend/* (cookies HttpOnly)
 * Tokens NUNCA ficam em localStorage / JS.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true, idempotencyKey }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const url = auth
    ? `/api/backend${path.startsWith("/") ? path : `/${path}`}`
    : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}${path}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });

  if (response.status === 401 && auth) {
    const refreshed = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshed.ok) {
      const retry = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "same-origin",
      });
      return parseResponse<T>(retry);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError("Não autenticado", 401);
  }

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (data as { message?: string })?.message ?? "Erro na API",
      response.status,
      data,
    );
  }

  return data as T;
}

/** Login Google via BFF — seta cookies HttpOnly; retorna só user. */
export async function loginWithGoogleIdToken(idToken: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "same-origin",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (data as { message?: string })?.message ?? "Falha no login",
      response.status,
      data,
    );
  }

  return data as { user: import("@/lib/auth").User };
}

export async function logout() {
  await fetch("/api/auth/login", {
    method: "DELETE",
    credentials: "same-origin",
  });
}

export async function fetchMe() {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      (data as { message?: string })?.message ?? "Erro ao obter perfil",
      response.status,
      data,
    );
  }

  return (await response.json()) as import("@/lib/auth").User;
}
