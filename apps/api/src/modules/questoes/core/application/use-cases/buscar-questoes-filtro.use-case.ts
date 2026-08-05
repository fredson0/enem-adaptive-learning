import { Inject, Injectable } from '@nestjs/common';
import type { AreaEnem } from '@generated/prisma';
import {
  QUESTOES_REPOSITORY,
  type QuestoesRepositoryPort,
} from '../ports/questoes.repository.port';

export type BuscarQuestoesInput = {
  area?: AreaEnem;
  ano?: number;
  limit?: number;
  offset?: number;
};

@Injectable()
export class BuscarQuestoesFiltroUseCase {
  constructor(
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(input: BuscarQuestoesInput) {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);

    const resultado = await this.questoesRepository.buscarComFiltro({
      area: input.area,
      ano: input.ano,
      limit,
      offset,
    });

    return {
      items: resultado.items.map((q) => q.toJSON()),
      total: resultado.total,
      limit: resultado.limit,
      offset: resultado.offset,
      hasMore: resultado.offset + resultado.items.length < resultado.total,
    };
  }
}
