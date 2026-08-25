import { apiFetch } from "@/lib/api";
import type { DepoimentosPublicosResponse } from "@/lib/testimonials";

export type MeuDepoimentoResponse = {
  depoimento: {
    id: string;
    texto: string;
    papel: string | null;
    criadoEm: string;
  } | null;
};

export async function listarDepoimentosPublicos() {
  const response = await fetch("/api/depoimentos", {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os depoimentos.");
  }

  return (await response.json()) as DepoimentosPublicosResponse;
}

export async function obterMeuDepoimento() {
  return apiFetch<MeuDepoimentoResponse>("/depoimentos/meu");
}

export async function enviarDepoimento(input: {
  texto: string;
  papel?: string;
}) {
  return apiFetch<{
    id: string;
    texto: string;
    papel: string | null;
    criadoEm: string;
  }>("/depoimentos", {
    method: "POST",
    body: input,
  });
}
