import type { AreaEnem } from '@generated/prisma';

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
}
