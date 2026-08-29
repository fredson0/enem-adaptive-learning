export const IA_ENGINE = Symbol('IA_ENGINE');

export type MensagemHistorico = {
  role: 'user' | 'assistant';
  texto: string;
  anexoUrl?: string;
};

export type ImagemAnexo = {
  mimeType: string;
  base64: string;
};

export type ContextoQuestao = {
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  gabarito: string;
  alternativaMarcada?: string;
  area?: string;
  disciplina?: string;
};

export type EnviarMensagemIaInput = {
  texto: string;
  historico?: MensagemHistorico[];
  contextoQuestao?: ContextoQuestao;
  contextoMetricas?: import('../helpers/tutor-prompts').ContextoAlunoMetricas;
  contextoTrilha?: import('../helpers/trilha-tutor.helper').ContextoTrilhaTutor;
  nivelAluno?: string;
  imagem?: ImagemAnexo;
  systemPromptOverride?: string;
  areaEnem?: import('@generated/prisma').AreaEnem;
  /** Força JSON válido na resposta (OpenAI/Groq/NVIDIA/Gemini). */
  responseFormat?: 'json_object';
  /** Tier de modelo — exatas usa modelo maior para Matemática/Natureza. */
  modelTier?: 'default' | 'exatas';
};

export type IaStreamDeltaHandler = (delta: string) => void | Promise<void>;

export interface IaEnginePort {
  enviarMensagem(input: EnviarMensagemIaInput): Promise<string>;
  enviarMensagemStream(
    input: EnviarMensagemIaInput,
    onDelta: IaStreamDeltaHandler,
  ): Promise<string>;
}
