import type { Prisma } from '@generated/prisma';
import { getFaixaIndiceArea } from '../../../../core/application/helpers/faixa-indice-enem.helper';
import { expandirTermosBusca } from '../../../../core/application/helpers/termos-busca.helper';
import type { FiltroQuestoes } from '../../../../core/application/types/filtro-questoes';

function condicaoTermoBusca(termo: string): Prisma.QuestaoWhereInput[] {
  const contains = { contains: termo, mode: 'insensitive' as const };

  return [
    { contexto: contains },
    { disciplina: contains },
    { introducaoAlternativas: contains },
  ];
}

export function buildQuestaoWhere(filtro?: FiltroQuestoes): Prisma.QuestaoWhereInput {
  if (!filtro) return {};

  const where: Prisma.QuestaoWhereInput = {};

  if (filtro.area) {
    where.area = filtro.area;

    const faixa = getFaixaIndiceArea(filtro.area);
    where.indice = { gte: faixa.min, lte: faixa.max };
  }

  if (filtro.anos?.length) {
    where.ano = { in: filtro.anos };
  } else if (filtro.ano) {
    where.ano = filtro.ano;
  }

  const termos = expandirTermosBusca(filtro.termosBusca ?? []);

  if (termos.length > 0) {
    where.OR = termos.flatMap((termo) => condicaoTermoBusca(termo));
  }

  return where;
}
