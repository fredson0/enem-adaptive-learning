import type { ChecklistItemIa, TrilhaArea, TrilhaEtapa, TrilhaResponse } from "@/lib/trilha";
import type { TrilhaAssuntoCatalogo } from "@/lib/trilha-catalogo";
import {
  getContextoEstudoAssunto,
  TRILHA_ASSUNTOS,
} from "@/lib/trilha-catalogo";

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function textoMencionaAssunto(
  texto: string,
  assunto: { nome: string; palavrasChave: string[] },
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
  assunto: { id: string; nome: string; areaSlug: string; palavrasChave: string[] },
): boolean {
  if (item.assuntoId === assunto.id) return true;
  if (item.areaSlug && item.areaSlug !== assunto.areaSlug) return false;
  return textoMencionaAssunto(item.texto, assunto);
}

export function calcularProgressoPorAssunto(
  trilha: Pick<TrilhaResponse, "checklistIa" | "areas">,
): Record<string, number> {
  const checklist = enriquecerChecklistComAssunto(trilha.checklistIa);
  const etapasPorArea = new Map(
    trilha.areas.map((area) => [area.slug, area.etapas]),
  );
  const disciplinasFocoPorArea = new Map(
    trilha.areas.map((area) => [area.slug, area.disciplinasSugeridas]),
  );
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

export function recalcularTrilhaProgresso(
  trilha: TrilhaResponse,
): TrilhaResponse {
  const checklistIa = enriquecerChecklistComAssunto(trilha.checklistIa);
  const areas = trilha.areas.map((area) => {
    const checklistArea = checklistIa.filter(
      (item) => !item.areaSlug || item.areaSlug === area.slug,
    );
    const progresso = calcularProgressoArea(area.etapas, checklistArea);
    return { ...area, progresso };
  });

  const progressoPorAssunto = calcularProgressoPorAssunto({
    checklistIa,
    areas,
  });

  return {
    ...trilha,
    checklistIa,
    areas,
    progressoPorAssunto,
  };
}

export function getProgressoAssunto(
  trilha: TrilhaResponse,
  assuntoId: string,
): number {
  return (
    trilha.progressoPorAssunto?.[assuntoId] ??
    calcularProgressoPorAssunto(trilha)[assuntoId] ??
    0
  );
}

export function getChecklistArea(
  trilha: TrilhaResponse,
  area: TrilhaArea,
  assuntoId?: string,
) {
  const checklist = enriquecerChecklistComAssunto(trilha.checklistIa).filter(
    (item) => !item.areaSlug || item.areaSlug === area.slug,
  );

  if (!assuntoId) return checklist;

  const assunto = TRILHA_ASSUNTOS.find((item) => item.id === assuntoId);
  if (!assunto) return checklist;

  return checklist.filter((item) => itemLigadoAoAssunto(item, assunto));
}

function appendAssuntoQuery(
  href: string | undefined,
  assunto: TrilhaAssuntoCatalogo,
  quantidade?: number,
): string | undefined {
  if (!href) return undefined;

  const params = new URLSearchParams(href.split("?")[1] ?? "");
  if (quantidade) params.set("quantidade", String(quantidade));
  params.set("assunto", assunto.nome);

  const base = href.split("?")[0];
  return `${base}?${params.toString()}`;
}

/** Recontextualiza etapas, links e textos para o assunto escolhido na trilha geral. */
export function adaptarAreaParaAssunto(
  area: TrilhaArea,
  assunto: TrilhaAssuntoCatalogo,
): TrilhaArea {
  const foco = assunto.nome;
  const contexto = getContextoEstudoAssunto(assunto);

  const etapas: TrilhaEtapa[] = area.etapas.map((etapa) => {
    switch (etapa.tipo) {
      case "orientacao":
        return {
          ...etapa,
          titulo: `Foco: ${foco}`,
          descricao: `Sua trilha em ${foco} começa pelos conceitos mais cobrados no ENEM em ${contexto}.`,
        };
      case "treino":
        return {
          ...etapa,
          titulo: `Treino guiado em ${foco} (5q)`,
          descricao: `5 questões de ${contexto} sobre ${foco} com gabarito imediato.`,
          href: appendAssuntoQuery(etapa.href, assunto, 5),
        };
      case "modalidade":
        return {
          ...etapa,
          titulo: `Simulado focado em ${foco} (10q)`,
          descricao: `10 questões de ${contexto} para medir seu domínio em ${foco}.`,
          href: appendAssuntoQuery(etapa.href, assunto, 10),
        };
      case "revisao":
        return {
          ...etapa,
          descricao: `Revise os erros de ${foco} com explicações do tutor IA.`,
        };
      case "tutor":
        return {
          ...etapa,
          descricao: `Peça um roteiro curto de estudos só para ${foco}.`,
        };
      case "cronometrado":
        return {
          ...etapa,
          titulo: `Prova cronometrada em ${foco}`,
          descricao: `10 questões de ${foco} em ${contexto} no ritmo de prova.`,
          href: appendAssuntoQuery(etapa.href, assunto, 10),
        };
      default:
        return etapa;
    }
  });

  const proximaEtapa = etapas.find((etapa) => !etapa.concluida) ?? null;
  const perguntaTutor = `Estou estudando ${foco} em ${contexto} no ENEM+. Quais são os tópicos mais importantes de ${foco} e por onde devo começar?`;

  return {
    ...area,
    disciplinasSugeridas: [foco],
    etapas,
    proximaEtapa,
    perguntaTutor,
  };
}

export {
  getAssuntoById,
  resolverAssuntoNoCatalogo,
  type ResolverAssuntoInput,
} from "@/lib/trilha-catalogo";

export function getMetaAreaContextual(
  trilha: TrilhaResponse,
  area: TrilhaArea,
  assunto?: TrilhaAssuntoCatalogo,
  isPrioridade = false,
): string | null {
  if (assunto) {
    const proxima = area.proximaEtapa;
    if (proxima) {
      return `Em ${assunto.nome}: ${proxima.titulo.toLowerCase()}.`;
    }
    return `Você concluiu as etapas de ${assunto.nome} nesta área.`;
  }

  if (trilha.planoIa?.areaSlug === area.slug) {
    return trilha.planoIa.metaSemanal;
  }

  if (isPrioridade) {
    return trilha.metaSemanal;
  }

  if (area.proximaEtapa) {
    return `Próximo passo: ${area.proximaEtapa.titulo}.`;
  }

  return null;
}
