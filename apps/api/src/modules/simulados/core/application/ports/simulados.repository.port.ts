import type { AreaEnem, StatusSimulado } from '@generated/prisma';
import type { Questao } from '../../../../questoes/core/domain/entities/questao.entity';

export type RespostaSimuladoData = {
  questaoId: string;
  alternativa: string;
  correto: boolean;
  respondidoEm: Date;
};

export type SimuladoResumo = {
  id: string;
  userId: string;
  area: AreaEnem | null;
  totalQuestoes: number;
  respondidas: number;
  acertos: number;
  status: StatusSimulado;
  questaoAtualIdx: number;
  iniciadoEm: Date;
  finalizadoEm: Date | null;
};

export type SimuladoDetalhe = SimuladoResumo & {
  questaoIds: string[];
  respostas: RespostaSimuladoData[];
};

export const SIMULADOS_REPOSITORY = Symbol('SIMULADOS_REPOSITORY');

export interface SimuladosRepositoryPort {
  criar(input: {
    userId: string;
    area: AreaEnem | null;
    questaoIds: string[];
  }): Promise<SimuladoDetalhe>;

  listarPorUsuario(userId: string): Promise<SimuladoResumo[]>;

  buscarPorId(id: string, userId: string): Promise<SimuladoDetalhe | null>;

  registrarResposta(input: {
    simuladoId: string;
    userId: string;
    questaoId: string;
    alternativa: string;
    correto: boolean;
  }): Promise<SimuladoDetalhe>;

  finalizar(simuladoId: string, userId: string): Promise<SimuladoDetalhe>;
}

export type SimuladoComQuestaoAtual = {
  simulado: SimuladoDetalhe;
  questaoAtual: Questao | null;
  indiceAtual: number;
  total: number;
  concluido: boolean;
};
