export type CoberturaAssuntoResumo = {
  assuntoId: string;
  nome: string;
  areaSlug: string;
  dominadas: number;
  disponiveis: number;
  percentual: number;
};

export function selecionarAssuntosCoberturaParaPrompt(
  assuntos: CoberturaAssuntoResumo[],
  options?: {
    areaSlug?: string | null;
    assuntoId?: string | null;
    limit?: number;
  },
): CoberturaAssuntoResumo[] {
  const limit = options?.limit ?? 6;
  let lista = assuntos.filter((item) => item.disponiveis > 0);

  if (options?.assuntoId) {
    const foco = lista.find((item) => item.assuntoId === options.assuntoId);
    if (foco) {
      const outros = lista
        .filter((item) => item.assuntoId !== foco.assuntoId)
        .sort((a, b) => a.percentual - b.percentual)
        .slice(0, Math.max(limit - 1, 0));
      return [foco, ...outros];
    }
  }

  if (options?.areaSlug) {
    lista = lista.filter((item) => item.areaSlug === options.areaSlug);
  }

  return [...lista]
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, limit);
}

export function buildCoberturaAssuntosBlock(
  assuntos: CoberturaAssuntoResumo[],
) {
  if (assuntos.length === 0) return '';

  const linhas = assuntos
    .map(
      (item) =>
        `- ${item.nome} (${item.areaSlug}): ${item.dominadas}/${item.disponiveis} dominadas (${item.percentual}%)`,
    )
    .join('\n');

  return `

Cobertura por assunto no banco ENEM+ (cada questão conta uma vez quando o aluno acerta):
${linhas}

Use estes dados ao sugerir o que revisar. Priorize assuntos com menor %. Não invente números.`;
}

export function formatarRespostaCobertura(input: {
  areas: {
    label: string;
    slug: string;
    dominadas: number;
    disponiveis: number;
    percentual: number;
  }[];
  assuntos: CoberturaAssuntoResumo[];
  areaSlug?: string | null;
}): string {
  const areas = input.areaSlug
    ? input.areas.filter((area) => area.slug === input.areaSlug)
    : input.areas;

  if (areas.every((area) => area.dominadas === 0)) {
    return 'Você ainda não dominou questões no banco. Faça simulados de treino — cada acerto conta uma vez na cobertura. Comece em /simulados/treino/novo?quantidade=5';
  }

  const linhasAreas = (areas.length > 0 ? areas : input.areas)
    .map(
      (area) =>
        `• ${area.label}: ${area.dominadas}/${area.disponiveis} dominadas (${area.percentual}%)`,
    )
    .join('\n');

  const assuntos = selecionarAssuntosCoberturaParaPrompt(input.assuntos, {
    areaSlug: input.areaSlug ?? undefined,
    limit: 8,
  });

  const linhasAssuntos = assuntos
    .map(
      (item) =>
        `• ${item.nome}: ${item.dominadas}/${item.disponiveis} (${item.percentual}%)`,
    )
    .join('\n');

  const tituloArea = input.areaSlug
    ? `Cobertura em ${areas[0]?.label ?? input.areaSlug}:`
    : 'Cobertura geral no banco ENEM+:';

  return `${tituloArea}

Por área:
${linhasAreas}

Assuntos com menor cobertura (priorize revisão):
${linhasAssuntos || '—'}

Veja gráficos em /progresso e a trilha em /trilha. Simulados com "priorizar não dominadas" focam em questões que você ainda não acertou.`;
}
