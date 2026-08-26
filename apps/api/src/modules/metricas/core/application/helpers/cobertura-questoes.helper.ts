import type { AreaEnem, Prisma } from '@generated/prisma';
import {
  TRILHA_ASSUNTOS,
  type TrilhaAssuntoCatalogo,
} from './trilha-assuntos.catalog';

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
  const termos = [
    assunto.nome,
    ...assunto.palavrasChave,
  ].filter(Boolean);

  const orConditions: Prisma.QuestaoWhereInput[] = termos.flatMap((termo) => {
    const contains = { contains: termo, mode: 'insensitive' as const };
    return [
      { contexto: contains },
      { disciplina: contains },
      { introducaoAlternativas: contains },
    ];
  });

  return {
    area,
    OR: orConditions,
  };
}

export function questaoCombinaAssunto(
  questao: {
    disciplina: string;
    contexto: string;
    introducaoAlternativas: string | null;
  },
  assunto: TrilhaAssuntoCatalogo,
): boolean {
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

export const ASSUNTOS_CATALOGO = TRILHA_ASSUNTOS;
