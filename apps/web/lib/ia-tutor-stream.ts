import { ApiError } from "@/lib/api";
import { getLoginPath } from "@/lib/login-redirect";
import type {
  EnviarMensagemTutorBody,
  EnviarMensagemTutorResponse,
} from "@/lib/ia-tutor";

type StreamCallbacks = {
  onDelta: (text: string) => void;
};

function parseSseChunk(
  chunk: string,
): Array<{ event: string; data: unknown }> {
  const events: Array<{ event: string; data: unknown }> = [];
  const blocks = chunk.split("\n\n");

  for (const block of blocks) {
    if (!block.trim()) continue;

    let event = "message";
    let dataLine = "";

    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLine += line.slice(5).trim();
      }
    }

    if (!dataLine) continue;

    try {
      events.push({ event, data: JSON.parse(dataLine) });
    } catch {
      continue;
    }
  }

  return events;
}

async function consumeSseStream(
  response: Response,
  callbacks: StreamCallbacks,
): Promise<EnviarMensagemTutorResponse> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiError("Resposta de streaming inválida", response.status);
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let result: EnviarMensagemTutorResponse | null = null;
  let errorMessage: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      for (const { event, data } of parseSseChunk(part)) {
        if (event === "delta") {
          const text = (data as { text?: string }).text;
          if (text) callbacks.onDelta(text);
        } else if (event === "done") {
          result = data as EnviarMensagemTutorResponse;
        } else if (event === "error") {
          errorMessage =
            (data as { message?: string }).message ??
            "Não foi possível enviar a mensagem.";
        }
      }
    }
  }

  if (buffer.trim()) {
    for (const { event, data } of parseSseChunk(buffer)) {
      if (event === "delta") {
        const text = (data as { text?: string }).text;
        if (text) callbacks.onDelta(text);
      } else if (event === "done") {
        result = data as EnviarMensagemTutorResponse;
      } else if (event === "error") {
        errorMessage =
          (data as { message?: string }).message ??
          "Não foi possível enviar a mensagem.";
      }
    }
  }

  if (errorMessage) {
    throw new ApiError(errorMessage, response.status);
  }

  if (!result) {
    throw new ApiError("Resposta incompleta do tutor", response.status);
  }

  return result;
}

export async function enviarMensagemTutorStream(
  body: EnviarMensagemTutorBody,
  callbacks: StreamCallbacks,
): Promise<EnviarMensagemTutorResponse> {
  const url = "/api/backend/ia-tutor/mensagens/stream";

  const run = () =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });

  let response = await run();

  if (response.status === 401) {
    const refreshed = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshed.ok) {
      response = await run();
    } else if (typeof window !== "undefined") {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.href = getLoginPath(next);
      throw new ApiError("Não autenticado", 401);
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      (data as { message?: string })?.message ?? "Erro na API",
      response.status,
      data,
    );
  }

  return consumeSseStream(response, callbacks);
}
