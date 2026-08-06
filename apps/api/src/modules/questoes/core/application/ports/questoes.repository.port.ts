import type { AreaEnem } from '@generated/prisma';
import type { Questao } from '../../domain/entities/questao.entity';
import type { FiltroQuestoes } from '../types/filtro-questoes';

export const QUESTOES_REPOSITORY = Symbol('QUESTOES_REPOSITORY');

export type BuscarQuestoesFiltro = FiltroQuestoes & {
  limit: number;
  offset: number;
};

export type BuscarQuestoesResultado = {
  items: Questao[];
  total: number;
  limit: number;
  offset: number;
};

export interface QuestoesRepositoryPort {
  buscarComFiltro(filtro: BuscarQuestoesFiltro): Promise<BuscarQuestoesResultado>;
  buscarAleatorias(
    filtro: FiltroQuestoes & {
      quantidade: number;
      excluirIds?: string[];
    },
  ): Promise<Questao[]>;
  buscarPorId(id: string): Promise<Questao | null>;
  buscarPorIds(ids: string[]): Promise<Questao[]>;
  contar(filtro?: FiltroQuestoes): Promise<number>;
}
