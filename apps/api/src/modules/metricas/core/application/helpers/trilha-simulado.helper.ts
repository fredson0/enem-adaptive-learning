import type { AreaEnem, ModoSimulado } from '@generated/prisma';
import { slugAreaEnem } from './area-enem-labels';
import {
  estadoTrilhaVazio,
  isEtapaIdValida,
  type TrilhaEstado,
} from './trilha.config';

const MODO_ETAPA_PREFIX: Record<ModoSimulado, string> = {
  TREINO: 'treino',
  MODALIDADE: 'modalidade',
  CRONOMETRADO: 'cronometrado',
};

export function etapaIdPorSimuladoFinalizado(
  modo: ModoSimulado,
  area: AreaEnem | null | undefined,
): string | null {
  if (!area) {
    return null;
  }

  const etapaId = `${MODO_ETAPA_PREFIX[modo]}-${slugAreaEnem(area)}`;
  return isEtapaIdValida(etapaId) ? etapaId : null;
}

export function etapaRevisaoPorArea(
  area: AreaEnem | null | undefined,
): string | null {
  if (!area) {
    return null;
  }

  const etapaId = `revisao-${slugAreaEnem(area)}`;
  return isEtapaIdValida(etapaId) ? etapaId : null;
}

export function marcarEtapasSimuladoNoEstado(
  estado: TrilhaEstado,
  etapaIds: string[],
): TrilhaEstado {
  const etapas = new Set(estado.etapasConcluidas);
  for (const etapaId of etapaIds) {
    if (isEtapaIdValida(etapaId)) {
      etapas.add(etapaId);
    }
  }

  return {
    ...estado,
    etapasConcluidas: Array.from(etapas),
  };
}

export function estadoTrilhaComSimuladoFinalizado(input: {
  estadoAtual?: TrilhaEstado | null;
  modo: ModoSimulado;
  area: AreaEnem | null | undefined;
  teveErros: boolean;
}): TrilhaEstado {
  const estado = input.estadoAtual ?? estadoTrilhaVazio();
  const etapas: string[] = [];

  const principal = etapaIdPorSimuladoFinalizado(input.modo, input.area);
  if (principal) {
    etapas.push(principal);
  }

  if (input.teveErros) {
    const revisao = etapaRevisaoPorArea(input.area);
    if (revisao) {
      etapas.push(revisao);
    }
  }

  return marcarEtapasSimuladoNoEstado(estado, etapas);
}
