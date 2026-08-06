import { Inject, Injectable } from '@nestjs/common';
import type { AreaEnem } from '@generated/prisma';
import { AREAS_ENEM } from '../helpers/area-enem-labels';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../ports/metricas.repository.port';

@Injectable()
export class CalcularProficienciaUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(userId: string) {
    const agregados = await this.metricasRepository.agregarPorArea(userId);
    const mapa = new Map(agregados.map((item) => [item.area, item]));

    for (const area of AREAS_ENEM) {
      const stats = mapa.get(area as AreaEnem);
      const total = stats?.totalQuestoes ?? 0;
      const acertos = stats?.acertos ?? 0;
      const score =
        total > 0 ? Math.round((acertos / total) * 1000) / 10 : 0;

      await this.metricasRepository.upsertProficiencia(
        userId,
        area as AreaEnem,
        total,
        acertos,
        score,
      );
    }

    return this.metricasRepository.listarProficiencias(userId);
  }
}
