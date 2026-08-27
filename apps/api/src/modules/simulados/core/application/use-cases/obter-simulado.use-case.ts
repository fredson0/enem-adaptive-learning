import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import {
  SIMULADOS_REPOSITORY,
  type SimuladoComQuestaoAtual,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

export type ObterSimuladoInput = {
  simuladoId: string;
  userId: string;
  ordem?: number;
};

@Injectable()
export class ObterSimuladoUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(input: ObterSimuladoInput) {
    const simulado = await this.simuladosRepository.buscarPorId(
      input.simuladoId,
      input.userId,
    );

    if (!simulado) {
      throw new NotFoundException('Simulado não encontrado');
    }

    return this.montarResposta(simulado, input.ordem);
  }

  private async montarResposta(
    simulado: NonNullable<Awaited<ReturnType<SimuladosRepositoryPort['buscarPorId']>>>,
    ordemSolicitada?: number,
  ) {
    const concluido = simulado.status === 'CONCLUIDO';
    const indiceAtual = Math.min(simulado.questaoAtualIdx, simulado.questaoIds.length - 1);
    const respostasMap = new Map(
      simulado.respostas.map((r) => [r.questaoId, r]),
    );

    const navegacao = simulado.questaoIds.map((questaoId, ordem) => {
      const resposta = respostasMap.get(questaoId);
      return {
        ordem,
        questaoId,
        respondida: Boolean(resposta),
        correto: resposta?.correto,
        alternativa: resposta?.alternativa,
      };
    });

    let indiceExibido = indiceAtual;
    let modoVisualizacao: 'ativa' | 'revisao' = 'ativa';

    if (ordemSolicitada !== undefined) {
      if (
        !Number.isInteger(ordemSolicitada) ||
        ordemSolicitada < 0 ||
        ordemSolicitada >= simulado.totalQuestoes
      ) {
        throw new BadRequestException('Ordem de questão inválida');
      }

      if (ordemSolicitada > simulado.respondidas) {
        throw new BadRequestException('Esta questão ainda não foi respondida');
      }

      indiceExibido = ordemSolicitada;
      modoVisualizacao =
        ordemSolicitada < simulado.respondidas ? 'revisao' : 'ativa';
    }

    const questaoIdExibida = simulado.questaoIds[indiceExibido];
    const questaoRow = questaoIdExibida
      ? await this.questoesRepository.buscarPorId(questaoIdExibida)
      : null;

    const respostaExibida = questaoIdExibida
      ? respostasMap.get(questaoIdExibida)
      : undefined;

    return {
      simulado,
      questaoAtual: questaoRow,
      indiceAtual: indiceExibido,
      total: simulado.totalQuestoes,
      concluido,
      respostas: simulado.respostas,
      navegacao,
      modoVisualizacao,
      respostaAtual: respostaExibida
        ? {
            alternativa: respostaExibida.alternativa,
            correto: respostaExibida.correto,
          }
        : null,
      indiceProgresso: indiceAtual,
    } satisfies SimuladoComQuestaoAtual & {
      respostas: typeof simulado.respostas;
      navegacao: typeof navegacao;
      modoVisualizacao: 'ativa' | 'revisao';
      respostaAtual: { alternativa: string; correto: boolean } | null;
      indiceProgresso: number;
    };
  }
}
