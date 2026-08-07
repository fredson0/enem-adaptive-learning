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
  nivelAluno?: string;
  imagem?: ImagemAnexo;
};

export interface IaEnginePort {
  enviarMensagem(input: EnviarMensagemIaInput): Promise<string>;
}
