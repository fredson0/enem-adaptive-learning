import { Inject, Injectable } from '@nestjs/common';
import {
  QUESTOES_REPOSITORY,
  type QuestoesRepositoryPort,
} from '../../../../questoes/core/application/ports/questoes.repository.port';
import { parseAreaEnem } from '../../../../questoes/core/application/helpers/area-enem';

@Injectable()
export class ObterFrequenciaTemasUseCase {
  constructor(
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(areaSlug?: string) {
    const area = areaSlug ? parseAreaEnem(areaSlug) : undefined;
    const frequencias = await this.questoesRepository.obterFrequenciaDisciplinas({
      area: area ?? undefined,
      limit: 15,
    });

    return {
      area: area ?? null,
      totalDisciplinas: frequencias.length,
      disciplinas: frequencias,
    };
  }
}
