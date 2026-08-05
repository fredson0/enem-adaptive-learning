import { AreaEnem } from '@generated/prisma';

export const DISCIPLINE_TO_AREA: Record<string, AreaEnem> = {
  linguagens: AreaEnem.LINGUAGENS,
  'ciencias-humanas': AreaEnem.HUMANAS,
  'ciencias-natureza': AreaEnem.NATUREZA,
  matematica: AreaEnem.MATEMATICA,
};

export const AREA_LABELS: Record<AreaEnem, string> = {
  [AreaEnem.LINGUAGENS]: 'Linguagens',
  [AreaEnem.HUMANAS]: 'Ciências Humanas',
  [AreaEnem.NATUREZA]: 'Ciências da Natureza',
  [AreaEnem.MATEMATICA]: 'Matemática',
};

export function parseAreaEnem(value: string): AreaEnem | null {
  const normalized = value.toLowerCase().replace(/-/g, '_');
  const map: Record<string, AreaEnem> = {
    linguagens: AreaEnem.LINGUAGENS,
    humanas: AreaEnem.HUMANAS,
    ciencias_humanas: AreaEnem.HUMANAS,
    natureza: AreaEnem.NATUREZA,
    ciencias_natureza: AreaEnem.NATUREZA,
    matematica: AreaEnem.MATEMATICA,
    matemática: AreaEnem.MATEMATICA,
  };

  return map[normalized] ?? null;
}
