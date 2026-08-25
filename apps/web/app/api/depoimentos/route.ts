import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3333";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/depoimentos/publico`, {
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: (data as { message?: string })?.message ?? "Erro ao listar depoimentos" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "API indisponível" },
      { status: 503 },
    );
  }
}
