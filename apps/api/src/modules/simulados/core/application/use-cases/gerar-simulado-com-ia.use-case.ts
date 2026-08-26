import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IA_ENGINE } from '../../../../ia-tutor/core/application/ports/ia-engine.port';
import type { IaEnginePort } from '../../../../ia-tutor/core/application/ports/ia-engine.port';
import { MODO_SIMULADO_CONFIG } from '../helpers/modo-simulado.config';
import {
  buildInterpretarPedidoSimuladoPrompt,
  parsePedidoSimuladoJson,
} from '../helpers/interpretar-pedido-simulado';
import { GerarSimuladoUseCase } from './gerar-simulado.use-case';

export type GerarSimuladoComIaInput = {
  userId: string;
  pedido: string;
  modo?: import('@generated/prisma').ModoSimulado;
};

@Injectable()
export class GerarSimuladoComIaUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(GerarSimuladoUseCase)
    private readonly gerarSimuladoUseCase: GerarSimuladoUseCase,
  ) {}

  async execute(input: GerarSimuladoComIaInput) {
    const modo = input.modo ?? 'TREINO';

    if (!MODO_SIMULADO_CONFIG[modo].permitePedidoIa) {
      throw new BadRequestException(
        'Este modo de simulado não aceita pedido em linguagem natural. Use os filtros manuais.',
      );
    }

    const pedido = input.pedido.trim();
    if (pedido.length < 10) {
      throw new BadRequestException(
        'Descreva o simulado com mais detalhes (mínimo 10 caracteres).',
      );
    }

    let respostaIa: string;

    try {
      respostaIa = await this.iaEngine.enviarMensagem({
        texto: buildInterpretarPedidoSimuladoPrompt(pedido),
        nivelAluno: 'INICIANTE',
      });
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new BadRequestException(
        'Não foi possível interpretar seu pedido com a IA. Tente novamente ou use os filtros manuais.',
      );
    }

    let plano;

    try {
      plano = parsePedidoSimuladoJson(respostaIa, pedido);
    } catch {
      throw new BadRequestException(
        'A IA retornou um plano inválido. Reformule o pedido ou use os filtros manuais.',
      );
    }

    const simulado = await this.gerarSimuladoUseCase.execute({
      userId: input.userId,
      modo,
      area: plano.area ?? undefined,
      anos: plano.anos ?? undefined,
      termosBusca: plano.termosBusca.length ? plano.termosBusca : undefined,
      quantidade: plano.quantidade,
      priorizarNaoDominadas: true,
    });

    return {
      ...simulado,
      plano: {
        titulo: plano.titulo,
        resumo: plano.resumo,
        area: plano.area,
        termosBusca: plano.termosBusca,
        anos: plano.anos,
      },
    };
  }
}
