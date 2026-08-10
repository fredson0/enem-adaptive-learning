import { BadRequestException } from '@nestjs/common';
import type { ModoSimulado } from '@generated/prisma';

const SEGUNDOS_POR_QUESTAO_CRONOMETRADO = 240;

export type ModoSimuladoConfig = {
  revelarGabaritoImediato: boolean;
  tempoLimiteSegundos: number | null;
  areaObrigatoria: boolean;
  quantidadesPermitidas: readonly number[];
  permitePedidoIa: boolean;
};

export const MODO_SIMULADO_CONFIG: Record<ModoSimulado, ModoSimuladoConfig> = {
  TREINO: {
    revelarGabaritoImediato: true,
    tempoLimiteSegundos: null,
    areaObrigatoria: false,
    quantidadesPermitidas: [5, 10, 20],
    permitePedidoIa: true,
  },
  MODALIDADE: {
    revelarGabaritoImediato: true,
    tempoLimiteSegundos: null,
    areaObrigatoria: true,
    quantidadesPermitidas: [10, 20, 45],
    permitePedidoIa: true,
  },
  CRONOMETRADO: {
    revelarGabaritoImediato: false,
    tempoLimiteSegundos: null,
    areaObrigatoria: true,
    quantidadesPermitidas: [10, 20, 45],
    permitePedidoIa: false,
  },
};

export function parseModoSimulado(value?: string): ModoSimulado {
  const modo = (value ?? 'TREINO').toUpperCase();
  if (modo === 'TREINO' || modo === 'MODALIDADE' || modo === 'CRONOMETRADO') {
    return modo;
  }
  throw new BadRequestException(
    'modo inválido. Use: treino, modalidade ou cronometrado.',
  );
}

export function resolverConfigModo(
  modo: ModoSimulado,
  quantidade: number,
): Pick<ModoSimuladoConfig, 'revelarGabaritoImediato' | 'tempoLimiteSegundos'> {
  const base = MODO_SIMULADO_CONFIG[modo];

  if (modo === 'CRONOMETRADO') {
    return {
      revelarGabaritoImediato: false,
      tempoLimiteSegundos: quantidade * SEGUNDOS_POR_QUESTAO_CRONOMETRADO,
    };
  }

  return {
    revelarGabaritoImediato: base.revelarGabaritoImediato,
    tempoLimiteSegundos: base.tempoLimiteSegundos,
  };
}

export function validarQuantidadeModo(modo: ModoSimulado, quantidade: number) {
  const config = MODO_SIMULADO_CONFIG[modo];
  if (!config.quantidadesPermitidas.includes(quantidade)) {
    throw new BadRequestException(
      `Quantidade ${quantidade} não permitida para modo ${modo}. Use: ${config.quantidadesPermitidas.join(', ')}.`,
    );
  }
}
