import { Inject, Injectable } from '@nestjs/common';
import {
  QUESTOES_REPOSITORY,
  type QuestoesRepositoryPort,
} from '../ports/questoes.repository.port';
import type { FiltroQuestoes } from '../types/filtro-questoes';

export type ContarQuestoesInput = FiltroQuestoes;

@Injectable()
export class ContarQuestoesUseCase {
  constructor(
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(input: ContarQuestoesInput) {
    const filtro: FiltroQuestoes = {
      area: input.area,
      ano: input.anos?.length ? undefined : input.ano,
      anos: input.anos?.length ? input.anos : undefined,
      termosBusca: input.termosBusca,
    };

    const total = await this.questoesRepository.contar(filtro);

    return {
      total,
      area: input.area ?? null,
      anos: input.anos ?? null,
      termosBusca: input.termosBusca ?? [],
    };
  }
}
