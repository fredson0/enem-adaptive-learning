export const IA_ENGINE = Symbol('IA_ENGINE');

export type MensagemHistorico = {
  role: 'user' | 'assistant';
  texto: string;
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
  nivelAluno?: string;
};

export interface IaEnginePort {
  enviarMensagem(input: EnviarMensagemIaInput): Promise<string>;
}
