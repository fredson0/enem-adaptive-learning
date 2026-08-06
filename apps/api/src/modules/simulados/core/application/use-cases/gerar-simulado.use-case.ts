import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { FiltroQuestoes } from '../../../../questoes/core/application/types/filtro-questoes';
import {
  SIMULADOS_REPOSITORY,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

export type GerarSimuladoInput = {
  userId: string;
  quantidade: number;
} & FiltroQuestoes;

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

    const filtro: FiltroQuestoes = {
      area: input.area,
      ano: input.anos?.length ? undefined : input.ano,
      anos: input.anos?.length ? input.anos : undefined,
      termosBusca: input.termosBusca,
    };

    const questoes = await this.questoesRepository.buscarAleatorias({
      ...filtro,
      quantidade,
    });

    if (questoes.length < quantidade) {
      const total = await this.questoesRepository.contar(filtro);

      if (total === 0) {
        throw new BadRequestException(
          'Não há questões no banco para esses filtros. Tente outros termos ou rode o seed.',
        );
      }

      throw new BadRequestException(
        `Só há ${questoes.length} questão(ões) disponíveis para esses filtros (total no banco: ${total}).`,
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
