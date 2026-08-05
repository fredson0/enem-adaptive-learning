import type { AreaEnem } from '@generated/prisma';
import type { Questao } from '../../domain/entities/questao.entity';

export const QUESTOES_REPOSITORY = Symbol('QUESTOES_REPOSITORY');

export type BuscarQuestoesFiltro = {
  area?: AreaEnem;
  ano?: number;
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
  buscarAleatorias(filtro: {
    area?: AreaEnem;
    ano?: number;
    quantidade: number;
    excluirIds?: string[];
  }): Promise<Questao[]>;
  buscarPorId(id: string): Promise<Questao | null>;
  buscarPorIds(ids: string[]): Promise<Questao[]>;
  contar(filtro?: { area?: AreaEnem; ano?: number }): Promise<number>;
}
