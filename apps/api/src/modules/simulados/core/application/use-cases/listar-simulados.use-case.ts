import { Inject, Injectable } from '@nestjs/common';
import type { ModoSimulado, StatusSimulado } from '@generated/prisma';
import {
  SIMULADOS_REPOSITORY,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

export type ListarSimuladosInput = {
  userId: string;
  modo?: ModoSimulado;
  status?: StatusSimulado;
  limit?: number;
  offset?: number;
};

@Injectable()
export class ListarSimuladosUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
  ) {}

  async execute(input: ListarSimuladosInput) {
    const resultado = await this.simuladosRepository.listarPorUsuario(
      input.userId,
      {
        modo: input.modo,
        status: input.status,
        limit: input.limit,
        offset: input.offset,
      },
    );

    return {
      items: resultado.items.map((s) => ({
        id: s.id,
        area: s.area,
        modo: s.modo,
        revelarGabaritoImediato: s.revelarGabaritoImediato,
        tempoLimiteSegundos: s.tempoLimiteSegundos,
        totalQuestoes: s.totalQuestoes,
        respondidas: s.respondidas,
        acertos: s.acertos,
        status: s.status,
        iniciadoEm: s.iniciadoEm,
        finalizadoEm: s.finalizadoEm,
      })),
      total: resultado.total,
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
    };
  }
}
