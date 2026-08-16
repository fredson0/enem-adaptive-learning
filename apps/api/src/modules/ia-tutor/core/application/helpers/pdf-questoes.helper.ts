const STOP_WORDS = new Set([
  'sobre',
  'explica',
  'explicar',
  'gerar',
  'gere',
  'pdf',
  'questao',
  'questoes',
  'questão',
  'questões',
  'material',
  'resumo',
  'baixar',
  'fazer',
  'quero',
  'preciso',
  'pode',
  'para',
  'como',
  'mais',
  'mim',
  'uma',
  'umas',
  'uns',
  'dos',
  'das',
  'nos',
  'nas',
  'que',
  'por',
  'the',
  'this',
  'me',
]);

export function extrairTermosBuscaPdf(texto?: string | null): string[] {
  if (!texto?.trim()) return [];

  const termos = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .map((termo) => termo.trim())
    .filter((termo) => termo.length >= 4 && !STOP_WORDS.has(termo));

  return [...new Set(termos)].slice(0, 4);
}

export function montarTituloPdfQuestoes(input: {
  assuntoNome?: string;
  termosBusca: string[];
  quantidade: number;
}): string {
  const foco =
    input.assuntoNome?.trim() ||
    (input.termosBusca.length > 0 ? input.termosBusca.join(', ') : 'ENEM');

  return `Questões de ${foco} · ${input.quantidade} itens`;
}
