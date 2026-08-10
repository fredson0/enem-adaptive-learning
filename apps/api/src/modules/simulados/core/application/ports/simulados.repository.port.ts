import type { AreaEnem, ModoSimulado, StatusSimulado } from '@generated/prisma';
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
  modo: ModoSimulado;
  revelarGabaritoImediato: boolean;
  tempoLimiteSegundos: number | null;
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

export type ListarSimuladosFiltro = {
  modo?: ModoSimulado;
  status?: StatusSimulado;
  limit?: number;
  offset?: number;
};

export const SIMULADOS_REPOSITORY = Symbol('SIMULADOS_REPOSITORY');

export interface SimuladosRepositoryPort {
  criar(input: {
    userId: string;
    area: AreaEnem | null;
    questaoIds: string[];
    modo: ModoSimulado;
    revelarGabaritoImediato: boolean;
    tempoLimiteSegundos: number | null;
  }): Promise<SimuladoDetalhe>;

  listarPorUsuario(
    userId: string,
    filtro?: ListarSimuladosFiltro,
  ): Promise<{ items: SimuladoResumo[]; total: number }>;

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
