import type { AreaEnem } from '@generated/prisma';

/**
 * No ENEM, cada prova tem 180 questões numeradas em sequência:
 * 1-45 Linguagens, 46-90 Humanas, 91-135 Natureza, 136-180 Matemática.
 * A api.enem.dev duplica o mesmo enunciado em várias disciplinas — a faixa de índice
 * é o critério confiável para separar as áreas.
 */
export const FAIXA_INDICE_POR_AREA: Record<
  AreaEnem,
  { min: number; max: number }
> = {
  LINGUAGENS: { min: 1, max: 45 },
  HUMANAS: { min: 46, max: 90 },
  NATUREZA: { min: 91, max: 135 },
  MATEMATICA: { min: 136, max: 180 },
};

export function getFaixaIndiceArea(area: AreaEnem) {
  return FAIXA_INDICE_POR_AREA[area];
}
