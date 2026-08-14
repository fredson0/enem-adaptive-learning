import { apiFetch } from "@/lib/api";

export type MensagemHistorico = {
  role: "user" | "assistant";
  texto: string;
  anexoUrl?: string;
};

export type EnviarMensagemTutorBody = {
  mensagem: string;
  conversaId?: string;
  anexoUrl?: string;
};

export type PresignAnexoResponse = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
};

export type TokensIa = {
  consumo: number;
  limite: number;
  restantes: number;
};

export type EnviarMensagemTutorResponse = {
  resposta: string;
  conversaId: string;
  tokens: TokensIa;
  trilhaAtualizada?: {
    etapasConcluidas: string[];
    checklistIa: import("@/lib/trilha").ChecklistItemIa[];
  };
};

export type ConversaResumo = {
  id: string;
  titulo: string;
  preview: string;
  atualizadoEm: string;
};

export type ConversaCompleta = {
  id: string;
  titulo: string;
  mensagens: MensagemHistorico[];
  atualizadoEm: string;
};

export type ExplicarErroBody = {
  questaoId: string;
  alternativaMarcada: string;
  perguntaExtra?: string;
};

export type ExplicarErroResponse = {
  resposta: string;
  questaoId: string;
  tokens: TokensIa;
};

export function obterSaldoTokens() {
  return apiFetch<TokensIa>("/ia-tutor/tokens", { auth: true });
}

export function listarConversasTutor() {
  return apiFetch<ConversaResumo[]>("/ia-tutor/conversas", { auth: true });
}

export function obterConversaTutor(conversaId: string) {
  return apiFetch<ConversaCompleta>(`/ia-tutor/conversas/${conversaId}`, {
    auth: true,
  });
}

export function criarConversaTutor(mensagens?: MensagemHistorico[]) {
  return apiFetch<ConversaCompleta>("/ia-tutor/conversas", {
    method: "POST",
    body: mensagens?.length ? { mensagens } : {},
  });
}

export function atualizarConversaTutor(conversaId: string, titulo: string) {
  return apiFetch<{ ok: boolean; titulo: string }>(
    `/ia-tutor/conversas/${conversaId}`,
    {
      method: "PATCH",
      body: { titulo },
    },
  );
}

export function excluirConversaTutor(conversaId: string) {
  return apiFetch<{ ok: boolean }>(`/ia-tutor/conversas/${conversaId}`, {
    method: "DELETE",
  });
}

export function enviarMensagemTutor(body: EnviarMensagemTutorBody) {
  return apiFetch<EnviarMensagemTutorResponse>("/ia-tutor/mensagens", {
    method: "POST",
    body,
  });
}

export function explicarErroQuestao(body: ExplicarErroBody) {
  return apiFetch<ExplicarErroResponse>("/ia-tutor/explicar-erro", {
    method: "POST",
    body,
  });
}

export function pedirDicaQuestao(questaoId: string) {
  return apiFetch<ExplicarErroResponse>("/ia-tutor/dica", {
    method: "POST",
    body: { questaoId },
  });
}

export function personalizarTrilhaComIa() {
  return apiFetch<{
    ok: boolean;
    planoIa: import("@/lib/trilha").PlanoIa;
    trilha: import("@/lib/trilha").TrilhaResponse;
  }>("/ia-tutor/trilha/personalizar", { method: "POST" });
}

export function conversarPersonalizarTrilha(body: {
  areaSlug?: string;
  assuntoId?: string;
  assuntoNome?: string;
  mensagem?: string;
  historico?: MensagemHistorico[];
  iniciar?: boolean;
}) {
  return apiFetch<{
    resposta: string;
    areaSlug: string;
    podeFinalizar: boolean;
  }>("/ia-tutor/trilha/conversa", {
    method: "POST",
    body,
  });
}

export function finalizarPersonalizarTrilha(body: {
  areaSlug: string;
  assuntoId?: string;
  assuntoNome?: string;
  historico: MensagemHistorico[];
}) {
  return apiFetch<{
    ok: boolean;
    planoIa: import("@/lib/trilha").PlanoIa;
    trilha: import("@/lib/trilha").TrilhaResponse;
  }>("/ia-tutor/trilha/finalizar", {
    method: "POST",
    body,
  });
}

export function presignAnexoTutor(contentType: string, fileName?: string) {
  return apiFetch<PresignAnexoResponse>("/ia-tutor/anexos/presign", {
    method: "POST",
    body: { contentType, fileName },
  });
}

function resolveUploadUrl(uploadUrl: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
  if (uploadUrl.startsWith(apiUrl)) {
    return uploadUrl.replace(apiUrl, "/api/backend");
  }
  return uploadUrl;
}

export async function uploadAnexoTutor(file: Blob, presign: PresignAnexoResponse) {
  const uploadUrl = resolveUploadUrl(presign.uploadUrl);
  const headers = { ...presign.headers };

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      (data as { message?: string })?.message ??
        "Não foi possível enviar a imagem.",
    );
  }

  return presign.publicUrl;
}
