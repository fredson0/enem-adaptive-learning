import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import {
  SIMULADOS_REPOSITORY,
  type SimuladoComQuestaoAtual,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

@Injectable()
export class ObterSimuladoUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(simuladoId: string, userId: string) {
    const simulado = await this.simuladosRepository.buscarPorId(simuladoId, userId);

    if (!simulado) {
      throw new NotFoundException('Simulado não encontrado');
    }

    return this.montarResposta(simulado);
  }

  private async montarResposta(
    simulado: NonNullable<Awaited<ReturnType<SimuladosRepositoryPort['buscarPorId']>>>,
  ): Promise<SimuladoComQuestaoAtual & { respostas: typeof simulado.respostas }> {
    const concluido = simulado.status === 'CONCLUIDO';
    const indiceAtual = Math.min(simulado.questaoAtualIdx, simulado.questaoIds.length - 1);
    const questaoIdAtual = simulado.questaoIds[indiceAtual];
    const questaoRow = questaoIdAtual
      ? await this.questoesRepository.buscarPorId(questaoIdAtual)
      : null;

    return {
      simulado,
      questaoAtual: questaoRow,
      indiceAtual,
      total: simulado.totalQuestoes,
      concluido,
      respostas: simulado.respostas,
    };
  }
}
