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
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';
import { CalcularProficienciaUseCase } from '../../../../metricas/core/application/use-cases/calcular-proficiencia.use-case';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../../../../metricas/core/application/ports/metricas.repository.port';
import { estadoTrilhaComSimuladoFinalizado } from '../../../../metricas/core/application/helpers/trilha-simulado.helper';

export type EnviarRespostaInput = {
  simuladoId: string;
  userId: string;
  questaoId: string;
  alternativa: string;
};

@Injectable()
export class EnviarRespostaUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(input: EnviarRespostaInput) {
    const simulado = await this.simuladosRepository.buscarPorId(
      input.simuladoId,
      input.userId,
    );

    if (!simulado) {
      throw new NotFoundException('Simulado não encontrado');
    }

    if (simulado.status === 'CONCLUIDO') {
      throw new BadRequestException('Simulado já finalizado');
    }

    if (!simulado.questaoIds.includes(input.questaoId)) {
      throw new BadRequestException('Questão não pertence a este simulado');
    }

    const questaoAtualId = simulado.questaoIds[simulado.questaoAtualIdx];
    if (questaoAtualId !== input.questaoId) {
      const jaRespondida = simulado.respostas.some(
        (r) => r.questaoId === input.questaoId,
      );
      if (!jaRespondida) {
        throw new BadRequestException('Responda a questão atual primeiro');
      }

      const existente = simulado.respostas.find(
        (r) => r.questaoId === input.questaoId,
      );
      return {
        correto: existente?.correto ?? false,
        gabarito: null,
        revelarGabaritoImediato: simulado.revelarGabaritoImediato,
        proximaQuestaoIdx: simulado.questaoAtualIdx,
        finalizado: false,
      };
    }

    const questao = await this.questoesRepository.buscarPorId(input.questaoId);
    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    const alternativa = input.alternativa.toUpperCase();
    const correto = questao.gabarito === alternativa;

    const atualizado = await this.simuladosRepository.registrarResposta({
      simuladoId: input.simuladoId,
      userId: input.userId,
      questaoId: input.questaoId,
      alternativa,
      correto,
    });

    const finalizado =
      atualizado.respondidas >= atualizado.totalQuestoes ||
      atualizado.questaoAtualIdx >= atualizado.totalQuestoes;

    return {
      correto,
      gabarito: simulado.revelarGabaritoImediato ? questao.gabarito : null,
      revelarGabaritoImediato: simulado.revelarGabaritoImediato,
      proximaQuestaoIdx: atualizado.questaoAtualIdx,
      respondidas: atualizado.respondidas,
      acertos: atualizado.acertos,
      finalizado,
    };
  }
}

@Injectable()
export class FinalizarSimuladoUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
    @Inject(CalcularProficienciaUseCase)
    private readonly calcularProficienciaUseCase: CalcularProficienciaUseCase,
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
  ) {}

  async execute(simuladoId: string, userId: string) {
    const simulado = await this.simuladosRepository.buscarPorId(simuladoId, userId);

    if (!simulado) {
      throw new NotFoundException('Simulado não encontrado');
    }

    const finalizado =
      simulado.status === 'CONCLUIDO'
        ? simulado
        : await this.simuladosRepository.finalizar(simuladoId, userId);

    if (simulado.status !== 'CONCLUIDO') {
      await this.calcularProficienciaUseCase.execute(userId);

      const teveErros = finalizado.respondidas > finalizado.acertos;
      const estadoAtual = await this.metricasRepository.obterTrilhaEstado(userId);
      const novoEstado = estadoTrilhaComSimuladoFinalizado({
        estadoAtual,
        modo: finalizado.modo,
        area: finalizado.area,
        teveErros,
      });
      await this.metricasRepository.salvarTrilhaEstado(userId, novoEstado);
    }

    const questoes = await this.questoesRepository.buscarPorIds(finalizado.questaoIds);
    const respostasMap = new Map(
      finalizado.respostas.map((r) => [r.questaoId, r]),
    );

    return {
      id: finalizado.id,
      area: finalizado.area,
      modo: finalizado.modo,
      revelarGabaritoImediato: finalizado.revelarGabaritoImediato,
      tempoLimiteSegundos: finalizado.tempoLimiteSegundos,
      totalQuestoes: finalizado.totalQuestoes,
      respondidas: finalizado.respondidas,
      acertos: finalizado.acertos,
      status: finalizado.status,
      iniciadoEm: finalizado.iniciadoEm,
      finalizadoEm: finalizado.finalizadoEm,
      questoes: questoes.map((q) => {
        const resposta = respostasMap.get(q.id);
        return {
          ...q.toPublico(),
          gabarito: q.gabarito,
          alternativaMarcada: resposta?.alternativa ?? null,
          correto: resposta?.correto ?? null,
        };
      }),
    };
  }
}
