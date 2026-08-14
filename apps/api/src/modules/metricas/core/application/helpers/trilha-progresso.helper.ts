import type { ChecklistItemIa } from './trilha.config';
import {
  TRILHA_ASSUNTOS,
  type TrilhaAssuntoCatalogo,
} from './trilha-assuntos.catalog';

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function textoMencionaAssunto(
  texto: string,
  assunto: TrilhaAssuntoCatalogo,
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

export function enriquecerChecklistComAssunto(
  checklist: ChecklistItemIa[],
): ChecklistItemIa[] {
  return checklist.map((item) => ({
    ...item,
    assuntoId: item.assuntoId ?? inferirAssuntoId(item.texto, item.areaSlug),
  }));
}

export function criarItemChecklist(input: {
  id: string;
  texto: string;
  areaSlug?: string;
  criadoEm?: string;
}): ChecklistItemIa {
  return {
    id: input.id,
    texto: input.texto,
    concluida: false,
    areaSlug: input.areaSlug,
    assuntoId: inferirAssuntoId(input.texto, input.areaSlug),
    criadoEm: input.criadoEm ?? new Date().toISOString(),
  };
}

export function calcularProgressoArea(
  etapas: { concluida: boolean }[],
  checklistArea: { concluida: boolean }[],
): number {
  const etapasTotal = etapas.length;
  const etapasDone = etapas.filter((etapa) => etapa.concluida).length;
  const checklistTotal = checklistArea.length;
  const checklistDone = checklistArea.filter((item) => item.concluida).length;

  if (etapasTotal === 0 && checklistTotal === 0) return 0;

  if (checklistTotal === 0) {
    return etapasTotal > 0
      ? Math.round((etapasDone / etapasTotal) * 100)
      : 0;
  }

  if (etapasTotal === 0) {
    return Math.round((checklistDone / checklistTotal) * 100);
  }

  const progressoEtapas = (etapasDone / etapasTotal) * 100;
  const progressoChecklist = (checklistDone / checklistTotal) * 100;

  return Math.round(0.6 * progressoEtapas + 0.4 * progressoChecklist);
}

function itemLigadoAoAssunto(
  item: ChecklistItemIa,
  assunto: TrilhaAssuntoCatalogo,
): boolean {
  if (item.assuntoId === assunto.id) return true;
  if (item.areaSlug && item.areaSlug !== assunto.areaSlug) return false;
  return textoMencionaAssunto(item.texto, assunto);
}

export function calcularProgressoPorAssunto(
  checklist: ChecklistItemIa[],
  etapasPorArea: Map<string, { concluida: boolean }[]>,
  disciplinasFocoPorArea: Map<string, string[]>,
): Record<string, number> {
  const resultado: Record<string, number> = {};

  for (const assunto of TRILHA_ASSUNTOS) {
    const itens = checklist.filter((item) => itemLigadoAoAssunto(item, assunto));

    if (itens.length > 0) {
      const concluidos = itens.filter((item) => item.concluida).length;
      resultado[assunto.id] = Math.round((concluidos / itens.length) * 100);
      continue;
    }

    const foco = disciplinasFocoPorArea.get(assunto.areaSlug) ?? [];
    const emFoco = foco.some(
      (disciplina) =>
        disciplina.toLowerCase().includes(assunto.nome.toLowerCase()) ||
        assunto.nome.toLowerCase().includes(disciplina.toLowerCase()) ||
        assunto.palavrasChave.some((palavra) =>
          disciplina.toLowerCase().includes(palavra.toLowerCase()),
        ),
    );

    if (!emFoco) {
      resultado[assunto.id] = 0;
      continue;
    }

    const etapas = etapasPorArea.get(assunto.areaSlug) ?? [];
    if (etapas.length === 0) {
      resultado[assunto.id] = 0;
      continue;
    }

    const etapasDone = etapas.filter((etapa) => etapa.concluida).length;
    resultado[assunto.id] = Math.round((etapasDone / etapas.length) * 50);
  }

  return resultado;
}
