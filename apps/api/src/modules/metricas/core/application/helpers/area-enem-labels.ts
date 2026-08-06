import { AreaEnem } from '@generated/prisma';

const LABELS: Record<AreaEnem, string> = {
  [AreaEnem.MATEMATICA]: 'Matemática',
  [AreaEnem.LINGUAGENS]: 'Linguagens',
  [AreaEnem.HUMANAS]: 'Ciências Humanas',
  [AreaEnem.NATUREZA]: 'Ciências da Natureza',
};

const SLUGS: Record<AreaEnem, string> = {
  [AreaEnem.MATEMATICA]: 'matematica',
  [AreaEnem.LINGUAGENS]: 'linguagens',
  [AreaEnem.HUMANAS]: 'humanas',
  [AreaEnem.NATUREZA]: 'natureza',
};

export function labelAreaEnem(area: AreaEnem | string): string {
  return LABELS[area as AreaEnem] ?? String(area);
}

export function slugAreaEnem(area: AreaEnem | string): string {
  return SLUGS[area as AreaEnem] ?? String(area).toLowerCase();
}

export const AREAS_ENEM = Object.values(AreaEnem);
