import type { AreaEnem } from '@generated/prisma';
import { getAssuntosPorArea } from '../../../../metricas/core/application/helpers/trilha-assuntos.catalog';
import { expandirTermosBusca } from './termos-busca.helper';

const AREA_PARA_SLUG: Record<AreaEnem, string> = {
  MATEMATICA: 'matematica',
  LINGUAGENS: 'linguagens',
  HUMANAS: 'humanas',
  NATUREZA: 'natureza',
};

/** Assuntos mais cobrados por área — espelha o catálogo da trilha. */
export function getTermosAssuntosFrequentes(area: AreaEnem): string[] {
  const assuntos = getAssuntosPorArea(AREA_PARA_SLUG[area]).slice(0, 6);

  return assuntos.flatMap((assunto) => [
    assunto.nome,
    ...assunto.palavrasChave,
  ]);
}

export function montarTermosBuscaSimulado(input: {
  termosIa?: string[];
  pedido?: string;
  area?: AreaEnem | null;
}): string[] {
  const termos: string[] = [...(input.termosIa ?? [])];

  if (input.pedido && input.area) {
    const pedeFrequentes = /mais cai|mais cobrad|mais comum|mais frequent/i.test(
      input.pedido,
    );

    if (pedeFrequentes) {
      termos.push(...getTermosAssuntosFrequentes(input.area));
    }
  }

  if (input.pedido) {
    const trechos = input.pedido
      .split(/[,;.!?]+/)
      .map((trecho) => trecho.trim())
      .filter((trecho) => trecho.length >= 4 && trecho.length <= 40);

    termos.push(...trechos);
  }

  return expandirTermosBusca(termos).slice(0, 16);
}
