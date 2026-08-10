import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { ModoSimulado } from '@generated/prisma';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { FiltroQuestoes } from '../../../../questoes/core/application/types/filtro-questoes';
import {
  MODO_SIMULADO_CONFIG,
  resolverConfigModo,
  validarQuantidadeModo,
} from '../helpers/modo-simulado.config';
import {
  SIMULADOS_REPOSITORY,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

export type GerarSimuladoInput = {
  userId: string;
  quantidade: number;
  modo?: ModoSimulado;
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
    const modo = input.modo ?? 'TREINO';
    const config = MODO_SIMULADO_CONFIG[modo];
    validarQuantidadeModo(modo, input.quantidade);

    if (config.areaObrigatoria && !input.area) {
      throw new BadRequestException(
        'Selecione a área do ENEM para este modo de simulado.',
      );
    }

    const quantidade = Math.min(Math.max(input.quantidade, 1), 45);
    const modoRuntime = resolverConfigModo(modo, quantidade);

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
      modo,
      revelarGabaritoImediato: modoRuntime.revelarGabaritoImediato,
      tempoLimiteSegundos: modoRuntime.tempoLimiteSegundos,
    });

    return this.toResponse(simulado);
  }

  private toResponse(simulado: Awaited<ReturnType<SimuladosRepositoryPort['criar']>>) {
    return {
      id: simulado.id,
      area: simulado.area,
      modo: simulado.modo,
      revelarGabaritoImediato: simulado.revelarGabaritoImediato,
      tempoLimiteSegundos: simulado.tempoLimiteSegundos,
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
