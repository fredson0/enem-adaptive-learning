import {
  corrigirJsonIa,
  extrairPrimeiroObjetoJson,
  parseJsonIa,
} from './ia-json.helper';

describe('ia-json.helper', () => {
  it('extrai objeto com chaves balanceadas dentro de markdown', () => {
    const texto = '```json\n{"metaSemanal": "Estudar 1h", "proximoPasso": "Revisar"}\n```';
    expect(extrairPrimeiroObjetoJson(texto)).toBe(
      '{"metaSemanal": "Estudar 1h", "proximoPasso": "Revisar"}',
    );
  });

  it('ignora chaves dentro de strings', () => {
    const texto = '{"resumo": "use { chaves } no texto", "ok": true}';
    const parsed = parseJsonIa<{ resumo: string; ok: boolean }>(texto);
    expect(parsed?.resumo).toBe('use { chaves } no texto');
    expect(parsed?.ok).toBe(true);
  });

  it('corrige valores string sem aspas', () => {
    const raw = '{ area: matematica, quantidade: 10 }';
    const fixed = corrigirJsonIa(raw);
    const parsed = JSON.parse(fixed) as { area: string; quantidade: number };
    expect(parsed.area).toBe('matematica');
    expect(parsed.quantidade).toBe(10);
  });

  it('retorna null quando não há JSON válido', () => {
    expect(parseJsonIa('só texto livre')).toBeNull();
  });
});
