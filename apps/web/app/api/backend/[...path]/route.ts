import { NextResponse } from "next/server";
import {
  applyAuthCookies,
  getAccessTokenFromCookies,
  nestFetch,
  rotateRefreshTokens,
} from "@/lib/auth-server";

export const dynamic = "force-dynamic";

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
  const isBinaryDownload =
    method === "GET" && nestPath.startsWith("/dev-uploads/");
  const isBinaryUpload =
    method === "PUT" && nestPath.includes("/ia-tutor/anexos/upload");

  let body: BodyInit | undefined;
  let forwardHeaders: HeadersInit | undefined;
  const idempotencyKey = request.headers.get("idempotency-key");

  if (method !== "GET" && method !== "DELETE") {
    if (isBinaryUpload) {
      const arrayBuffer = await request.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        return NextResponse.json({ message: "Arquivo vazio" }, { status: 400 });
      }
      body = Buffer.from(arrayBuffer);
      const contentType = request.headers.get("content-type");
      forwardHeaders = contentType
        ? { "Content-Type": contentType }
        : undefined;
    } else {
      body = await request.text();
      if (idempotencyKey) {
        forwardHeaders = { "Idempotency-Key": idempotencyKey };
      }
    }
  }

  const run = async (token: string) => {
    if (isBinaryDownload) {
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${token}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3333"}${nestPath}${search}`, {
        method,
        headers,
        cache: "no-store",
      });
      return { response, status: response.status };
    }

    const { data, status } = await nestFetch<unknown>(`${nestPath}${search}`, {
      method,
      body,
      accessToken: token,
      headers: forwardHeaders,
    });
    return { data, status, response: null as Response | null };
  };

  let result = await run(accessToken);

  if (result.status === 401) {
    rotated = await rotateRefreshTokens();
    if (!rotated) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    accessToken = rotated.accessToken;
    result = await run(accessToken);
  }

  if (isBinaryDownload && result.response) {
    const headers = new Headers();
    const contentType = result.response.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "private, max-age=3600");
    const binary = new NextResponse(result.response.body, {
      status: result.status,
      headers,
    });
    return rotated ? applyAuthCookies(binary, rotated) : binary;
  }

  const { data, status } = result;

  if (status === 204) {
    const empty = new NextResponse(null, { status: 204 });
    return rotated ? applyAuthCookies(empty, rotated) : empty;
  }

  const response = NextResponse.json(data, { status });
  return rotated ? applyAuthCookies(response, rotated) : response;
}
