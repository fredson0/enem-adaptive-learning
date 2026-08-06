import type { Prisma } from '@generated/prisma';
import type { FiltroQuestoes } from '../../../../core/application/types/filtro-questoes';

export function buildQuestaoWhere(filtro?: FiltroQuestoes): Prisma.QuestaoWhereInput {
  if (!filtro) return {};

  const where: Prisma.QuestaoWhereInput = {};

  if (filtro.area) {
    where.area = filtro.area;
  }

  if (filtro.anos?.length) {
    where.ano = { in: filtro.anos };
  } else if (filtro.ano) {
    where.ano = filtro.ano;
  }

  const termos = (filtro.termosBusca ?? [])
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  if (termos.length > 0) {
    where.OR = termos.map((termo) => ({
      contexto: { contains: termo, mode: 'insensitive' as const },
    }));
  }

  return where;
}
