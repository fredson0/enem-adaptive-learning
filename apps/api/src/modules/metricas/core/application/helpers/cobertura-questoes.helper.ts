import type { AreaEnem, Prisma } from '@generated/prisma';
import type { EstatisticaAreaBruta } from '../ports/metricas.repository.port';
import {
  TRILHA_ASSUNTOS,
  type TrilhaAssuntoCatalogo,
} from './trilha-assuntos.catalog';

const AREAS_ENEM: AreaEnem[] = [
  'MATEMATICA',
  'LINGUAGENS',
  'HUMANAS',
  'NATUREZA',
] as AreaEnem[];

const AREA_SLUGS: Record<AreaEnem, string> = {
  MATEMATICA: 'matematica',
  LINGUAGENS: 'linguagens',
  HUMANAS: 'humanas',
  NATUREZA: 'natureza',
};

export type CoberturaResumo = {
  dominadas: number;
  disponiveis: number;
  tentadas: number;
  percentual: number;
};

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function textoMencionaAssunto(
  texto: string,
  assunto: Pick<TrilhaAssuntoCatalogo, 'nome' | 'palavrasChave'>,
): boolean {
  const normalizado = normalizarTexto(texto);
  const nome = normalizarTexto(assunto.nome);

  if (normalizado.includes(nome)) return true;

  return assunto.palavrasChave.some((palavra) =>
    normalizado.includes(normalizarTexto(palavra)),
  );
}

export function inferirAssuntoId(
  texto: string,
  areaSlug?: string,
): string | undefined {
  const candidatos = areaSlug
    ? TRILHA_ASSUNTOS.filter((item) => item.areaSlug === areaSlug)
    : TRILHA_ASSUNTOS;

  let melhor: { id: string; score: number } | undefined;

  for (const assunto of candidatos) {
    let score = 0;
    const textoNorm = normalizarTexto(texto);
    const nomeNorm = normalizarTexto(assunto.nome);

    if (textoNorm.includes(nomeNorm)) score += 10;

    for (const palavra of assunto.palavrasChave) {
      if (textoNorm.includes(normalizarTexto(palavra))) score += 5;
    }

    if (score > 0 && (!melhor || score > melhor.score)) {
      melhor = { id: assunto.id, score };
    }
  }

  return melhor?.id;
}

export function inferirAssuntoIdParaQuestao(questao: {
  area: AreaEnem;
  disciplina: string;
  contexto: string;
  introducaoAlternativas?: string | null;
}): string | undefined {
  const texto = [
    questao.disciplina,
    questao.contexto,
    questao.introducaoAlternativas ?? '',
  ].join(' ');

  return inferirAssuntoId(texto, AREA_SLUGS[questao.area]);
}

export function buildAssuntoQuestaoWhere(
  assunto: TrilhaAssuntoCatalogo,
): Prisma.QuestaoWhereInput {
  const areaMap: Record<string, AreaEnem> = {
    matematica: 'MATEMATICA' as AreaEnem,
    linguagens: 'LINGUAGENS' as AreaEnem,
    humanas: 'HUMANAS' as AreaEnem,
    natureza: 'NATUREZA' as AreaEnem,
  };

  const area = areaMap[assunto.areaSlug];
  const termos = [assunto.nome, ...assunto.palavrasChave].filter(Boolean);

  const orConditions: Prisma.QuestaoWhereInput[] = [
    { assuntoId: assunto.id },
    ...termos.flatMap((termo) => {
      const contains = { contains: termo, mode: 'insensitive' as const };
      return [
        { contexto: contains },
        { disciplina: contains },
        { introducaoAlternativas: contains },
      ];
    }),
  ];

  return {
    area,
    OR: orConditions,
  };
}

export function questaoCombinaAssunto(
  questao: {
    assuntoId?: string | null;
    disciplina: string;
    contexto: string;
    introducaoAlternativas: string | null;
  },
  assunto: TrilhaAssuntoCatalogo,
): boolean {
  if (questao.assuntoId === assunto.id) return true;

  const texto = [
    questao.disciplina,
    questao.contexto,
    questao.introducaoAlternativas ?? '',
  ].join(' ');

  return textoMencionaAssunto(texto, assunto);
}

export function calcularPercentualCobertura(
  dominadas: number,
  disponiveis: number,
): number {
  if (disponiveis <= 0) return 0;
  return Math.round((dominadas / disponiveis) * 1000) / 10;
}

export function montarCoberturaResumo(
  dominadas: number,
  disponiveis: number,
  tentadas = 0,
): CoberturaResumo {
  return {
    dominadas,
    disponiveis,
    tentadas,
    percentual: calcularPercentualCobertura(dominadas, disponiveis),
  };
}

export function agregarCoberturaPorArea(input: {
  dominadas: { area: AreaEnem }[];
  disponiveisPorArea: Record<AreaEnem, number>;
}): EstatisticaAreaBruta[] {
  const dominadasPorArea = new Map<AreaEnem, number>();

  for (const questao of input.dominadas) {
    dominadasPorArea.set(
      questao.area,
      (dominadasPorArea.get(questao.area) ?? 0) + 1,
    );
  }

  return AREAS_ENEM.map((area) => ({
    area,
    totalQuestoes: input.disponiveisPorArea[area] ?? 0,
    acertos: dominadasPorArea.get(area) ?? 0,
  }));
}

export const ASSUNTOS_CATALOGO = TRILHA_ASSUNTOS;
