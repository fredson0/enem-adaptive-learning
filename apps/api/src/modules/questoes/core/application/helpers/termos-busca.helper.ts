const STOP_WORDS = new Set([
  'sobre',
  'questao',
  'questoes',
  'questão',
  'questões',
  'todos',
  'todas',
  'anos',
  'ano',
  'gere',
  'gerar',
  'quero',
  'preciso',
  'assunto',
  'assuntos',
  'de',
  'do',
  'da',
  'dos',
  'das',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'por',
  'para',
  'com',
  'sem',
  'que',
  'mais',
  'cai',
  'cair',
  'uma',
  'uns',
  'umas',
  'the',
]);

export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '');
}

function adicionarVariantes(termo: string, destino: Set<string>) {
  const limpo = termo.trim();
  if (limpo.length < 2 || limpo.length > 24) return;

  destino.add(limpo);

  const semAcento = removerAcentos(limpo);
  if (semAcento !== limpo) {
    destino.add(semAcento);
  }
}

/** Expande termos da IA/frases em palavras e variantes sem acento para busca no banco. */
export function expandirTermosBusca(termos: string[]): string[] {
  const destino = new Set<string>();

  for (const bruto of termos) {
    adicionarVariantes(bruto, destino);

    const palavras = bruto
      .split(/[^a-zA-Z0-9áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]+/)
      .map((palavra) => palavra.trim())
      .filter(
        (palavra) =>
          palavra.length >= 3 &&
          !STOP_WORDS.has(removerAcentos(palavra).toLowerCase()),
      );

    for (const palavra of palavras) {
      adicionarVariantes(palavra, destino);
    }
  }

  return [...destino].slice(0, 16);
}
