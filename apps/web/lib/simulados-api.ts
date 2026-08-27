import type { ModoSimuladoApi } from "@/lib/simulado-modos";
import {
  ANOS_ENEM,
  AREA_OPTIONS,
  QUANTIDADE_OPTIONS,
  type SimuladoGeradoComIa,
  type SimuladoResumo,
} from "@/lib/simulados";
import { apiFetch } from "@/lib/api";

export type ListarSimuladosResponse = {
  items: SimuladoResumo[];
  total: number;
  limit: number;
  offset: number;
};

export type ContagemQuestoesResponse = {
  total: number;
  area: string | null;
  anos: number[] | null;
  termosBusca: string[];
};

export function listarSimulados(params?: {
  modo?: ModoSimuladoApi;
  status?: "EM_ANDAMENTO" | "CONCLUIDO";
  limit?: number;
  offset?: number;
}) {
  const search = new URLSearchParams();
  if (params?.modo) search.set("modo", params.modo.toLowerCase());
  if (params?.status) search.set("status", params.status);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));

  const query = search.toString();
  return apiFetch<ListarSimuladosResponse>(
    `/simulados${query ? `?${query}` : ""}`,
    { auth: true },
  );
}

export function contarQuestoes(params: {
  area?: string;
  anos?: number[];
  termosBusca?: string[];
}) {
  const search = new URLSearchParams();
  if (params.area) search.set("area", params.area);
  if (params.anos?.length) {
    search.set("anos", params.anos.join(","));
  }
  if (params.termosBusca?.length) {
    search.set("termosBusca", params.termosBusca.join(","));
  }

  return apiFetch<ContagemQuestoesResponse>(
    `/questoes/contagem?${search.toString()}`,
    { auth: true },
  );
}

export function criarSimulado(body: {
  modo: ModoSimuladoApi;
  area?: string;
  quantidade: number;
  anos?: number[];
  termosBusca?: string[];
  priorizarNaoDominadas?: boolean;
}) {
  return apiFetch<{ id: string }>("/simulados", {
    method: "POST",
    auth: true,
    body: {
      ...body,
      modo: body.modo.toLowerCase(),
    },
  });
}

export function gerarSimuladoComIa(body: {
  pedido: string;
  modo: ModoSimuladoApi;
}) {
  return apiFetch<SimuladoGeradoComIa>("/simulados/gerar-com-ia", {
    method: "POST",
    auth: true,
    body: {
      ...body,
      modo: body.modo.toLowerCase(),
    },
  });
}

export function obterResultadoSimulado(simuladoId: string) {
  return apiFetch<import("@/lib/simulados").SimuladoResultado>(
    `/simulados/${simuladoId}/resultado`,
    { auth: true },
  );
}

export function obterSimulado(simuladoId: string, ordem?: number) {
  const query = ordem !== undefined ? `?ordem=${ordem}` : "";
  return apiFetch<import("@/lib/simulados").SimuladoDetalhe>(
    `/simulados/${simuladoId}${query}`,
    { auth: true },
  );
}

export function excluirSimulado(simuladoId: string) {
  return apiFetch<{ ok: boolean }>(`/simulados/${simuladoId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function refazerErrosSimulado(simuladoId: string) {
  return apiFetch<{ id: string; totalQuestoes: number }>(
    `/simulados/${simuladoId}/refazer-erros`,
    {
      method: "POST",
      auth: true,
    },
  );
}

export { ANOS_ENEM, AREA_OPTIONS, QUANTIDADE_OPTIONS };
