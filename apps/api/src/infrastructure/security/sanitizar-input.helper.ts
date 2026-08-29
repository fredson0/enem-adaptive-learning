/**
 * Higiene de strings vindas do cliente antes de persistir ou buscar no banco.
 * Não substitui prepared statements (Prisma) — complementa contra payloads maliciosos.
 */

const CONTROLE_PERIGOSO = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function removerCaracteresDeControle(texto: string): string {
  return texto.replace(CONTROLE_PERIGOSO, '');
}

export function sanitizarTextoUsuario(
  texto: string,
  maxLength = 500,
): string {
  if (typeof texto !== 'string') {
    return '';
  }

  return removerCaracteresDeControle(texto)
    .trim()
    .slice(0, maxLength);
}

/** Termos de busca: só letras, números e acentos comuns; descarta o resto. */
export function sanitizarTermoBusca(termo: string): string {
  const limpo = sanitizarTextoUsuario(termo, 60);
  return limpo.replace(/[^a-zA-Z0-9áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ\s-]/g, '');
}

export function sanitizarListaTermosBusca(termos: string[]): string[] {
  return termos
    .map((termo) => sanitizarTermoBusca(termo))
    .filter((termo) => termo.length >= 2);
}
