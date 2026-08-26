import type { QuestoesRepositoryPort } from '../ports/questoes.repository.port';
import type { FiltroQuestoes } from '../types/filtro-questoes';
import {
  getIndicadoresArea,
  selecionarQuestoesRelevantes,
} from './relevancia-questoes.helper';
import { getTermosAssuntosFrequentes } from './termos-simulado.helper';

const LIMITE_CANDIDATAS = 180;

export async function buscarQuestoesAleatoriasComFallback(input: {
  questoesRepository: QuestoesRepositoryPort;
  filtro: FiltroQuestoes;
  quantidade: number;
}) {
  const area = input.filtro.area;
  const termosBase = input.filtro.termosBusca ?? [];

  const estrategias: string[][] = [
    termosBase,
    area ? getTermosAssuntosFrequentes(area) : [],
    area ? getIndicadoresArea(area) : [],
  ].filter((termos) => termos.length > 0);

  if (estrategias.length === 0 && area) {
    estrategias.push(getIndicadoresArea(area));
  }

  for (const termos of estrategias) {
    const questoes = await buscarComRelevancia({
      questoesRepository: input.questoesRepository,
      filtro: {
        area: input.filtro.area,
        ano: input.filtro.ano,
        anos: input.filtro.anos,
        excluirIds: input.filtro.excluirIds,
      },
      termos,
      quantidade: input.quantidade,
      pontuacaoMinima: termos === termosBase ? 1 : 2,
    });

    if (questoes.length >= input.quantidade) {
      return questoes;
    }
  }

  if (area) {
    return buscarComRelevancia({
      questoesRepository: input.questoesRepository,
      filtro: {
        area: input.filtro.area,
        ano: input.filtro.ano,
        anos: input.filtro.anos,
        excluirIds: input.filtro.excluirIds,
      },
      termos: getIndicadoresArea(area),
      quantidade: input.quantidade,
      pontuacaoMinima: 1,
    });
  }

  return [];
}

async function buscarComRelevancia(input: {
  questoesRepository: QuestoesRepositoryPort;
  filtro: FiltroQuestoes;
  termos: string[];
  quantidade: number;
  pontuacaoMinima: number;
}) {
  const resultado = await input.questoesRepository.buscarComFiltro({
    ...input.filtro,
    limit: LIMITE_CANDIDATAS,
    offset: 0,
  });

  if (resultado.items.length === 0) {
    return [];
  }

  return selecionarQuestoesRelevantes({
    candidatas: resultado.items,
    quantidade: input.quantidade,
    termos: input.termos,
    area: input.filtro.area,
    pontuacaoMinima: input.pontuacaoMinima,
  });
}
