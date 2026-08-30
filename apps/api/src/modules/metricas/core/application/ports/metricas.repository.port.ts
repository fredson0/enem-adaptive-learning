import type { AreaEnem } from '@generated/prisma';
import type { TrilhaEstado } from '../helpers/trilha.config';

export const METRICAS_REPOSITORY = Symbol('METRICAS_REPOSITORY');

export type EstatisticaAreaBruta = {
  area: AreaEnem;
  totalQuestoes: number;
  acertos: number;
};

export type PontoEvolucaoBruto = {
  simuladoId: string;
  area: AreaEnem | null;
  acertos: number;
  totalQuestoes: number;
  finalizadoEm: Date;
};

export type UltimoSimuladoBruto = {
  id: string;
  area: AreaEnem | null;
  acertos: number;
  totalQuestoes: number;
  finalizadoEm: Date | null;
};

export type ResumoSimuladosBruto = {
  simuladosConcluidos: number;
  questoesRespondidas: number;
  mediaGeralPercentual: number | null;
};

export type QuestaoDominioBruto = {
  id: string;
  area: AreaEnem;
  ano: number;
  assuntoId?: string | null;
  disciplina: string;
  contexto: string;
  introducaoAlternativas: string | null;
};

export type CoberturaBruta = {
  dominadas: QuestaoDominioBruto[];
  tentadas: QuestaoDominioBruto[];
  disponiveisPorArea: Record<AreaEnem, number>;
  disponiveisPorAno: { ano: number; total: number }[];
};

export type RespostaDisciplinaBruta = {
  correto: boolean;
  disciplina: string;
  area: AreaEnem;
};

export interface MetricasRepositoryPort {
  agregarPorArea(userId: string): Promise<EstatisticaAreaBruta[]>;
  upsertProficiencia(
    userId: string,
    area: AreaEnem,
    totalQuestoes: number,
    acertos: number,
    score: number,
  ): Promise<void>;
  listarEvolucao(userId: string, limit?: number): Promise<PontoEvolucaoBruto[]>;
  obterUltimoSimulado(userId: string): Promise<UltimoSimuladoBruto | null>;
  obterResumoSimulados(userId: string): Promise<ResumoSimuladosBruto>;
  listarProficiencias(userId: string): Promise<
    {
      area: AreaEnem;
      score: number;
      totalQuestoes: number;
      acertos: number;
      atualizadoEm: Date;
    }[]
  >;
  obterTrilhaEstado(userId: string): Promise<TrilhaEstado | null>;
  salvarTrilhaEstado(userId: string, estado: TrilhaEstado): Promise<void>;
  obterTempoDiarioMinutos(userId: string): Promise<number>;
  obterCoberturaBruta(userId: string): Promise<CoberturaBruta>;
  obterIdsQuestoesDominadas(userId: string): Promise<string[]>;
  listarRespostasPorDisciplina(userId: string): Promise<RespostaDisciplinaBruta[]>;
}
