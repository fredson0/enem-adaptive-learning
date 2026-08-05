import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { AreaEnem } from '@generated/prisma';
import {
  SIMULADOS_REPOSITORY,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

export type GerarSimuladoInput = {
  userId: string;
  area?: AreaEnem;
  ano?: number;
  quantidade: number;
};

@Injectable()
export class GerarSimuladoUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(input: GerarSimuladoInput) {
    const quantidade = Math.min(Math.max(input.quantidade, 1), 45);

    const questoes = await this.questoesRepository.buscarAleatorias({
      area: input.area,
      ano: input.ano,
      quantidade,
    });

    if (questoes.length < quantidade) {
      const total = await this.questoesRepository.contar({
        area: input.area,
        ano: input.ano,
      });

      if (total === 0) {
        throw new BadRequestException(
          'Não há questões no banco para os filtros selecionados. Rode o seed primeiro.',
        );
      }

      throw new BadRequestException(
        `Só há ${questoes.length} questão(ões) disponíveis para esses filtros.`,
      );
    }

    const simulado = await this.simuladosRepository.criar({
      userId: input.userId,
      area: input.area ?? null,
      questaoIds: questoes.map((q) => q.id),
    });

    return this.toResponse(simulado);
  }

  private toResponse(simulado: Awaited<ReturnType<SimuladosRepositoryPort['criar']>>) {
    return {
      id: simulado.id,
      area: simulado.area,
      totalQuestoes: simulado.totalQuestoes,
      respondidas: simulado.respondidas,
      acertos: simulado.acertos,
      status: simulado.status,
      questaoAtualIdx: simulado.questaoAtualIdx,
      iniciadoEm: simulado.iniciadoEm,
      finalizadoEm: simulado.finalizadoEm,
    };
  }
}
