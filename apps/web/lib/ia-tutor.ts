import { apiFetch } from "@/lib/api";

export type MensagemHistorico = {
  role: "user" | "assistant";
  texto: string;
};

export type EnviarMensagemTutorBody = {
  mensagem: string;
  historico?: MensagemHistorico[];
};

export type TokensIa = {
  consumo: number;
  limite: number;
  restantes: number;
};

export type EnviarMensagemTutorResponse = {
  resposta: string;
  tokens: TokensIa;
};

export function enviarMensagemTutor(body: EnviarMensagemTutorBody) {
  return apiFetch<EnviarMensagemTutorResponse>("/ia-tutor/mensagens", {
    method: "POST",
    body,
  });
}
