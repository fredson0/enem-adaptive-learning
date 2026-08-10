import {
  BadRequestException,
  Inject,
  Injectable,
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

    const respostaIa = await this.iaEngine.enviarMensagem({
      texto: buildInterpretarPedidoSimuladoPrompt(pedido),
      nivelAluno: 'INICIANTE',
    });

    const plano = parsePedidoSimuladoJson(respostaIa);

    const simulado = await this.gerarSimuladoUseCase.execute({
      userId: input.userId,
      modo,
      area: plano.area ?? undefined,
      anos: plano.anos ?? undefined,
      termosBusca: plano.termosBusca.length ? plano.termosBusca : undefined,
      quantidade: plano.quantidade,
    });

    return {
      ...simulado,
      plano: {
        titulo: plano.titulo,
        resumo: plano.resumo,
        termosBusca: plano.termosBusca,
        anos: plano.anos,
      },
    };
  }
}
