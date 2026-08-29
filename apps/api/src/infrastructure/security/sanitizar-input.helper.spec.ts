import {
  sanitizarListaTermosBusca,
  sanitizarTermoBusca,
} from './sanitizar-input.helper';

describe('sanitizar-input.helper', () => {
  it('remove caracteres de controle e null byte', () => {
    expect(sanitizarTermoBusca("fun\u0000ções'; DROP TABLE--")).toBe(
      "funções DROP TABLE--",
    );
  });

  it('limita tamanho e filtra lista', () => {
    const lista = sanitizarListaTermosBusca([
      'física',
      "x'; DELETE FROM questoes; --",
      'a',
    ]);
    expect(lista).toContain('física');
    expect(lista.some((item) => item.includes(';'))).toBe(false);
    expect(lista).not.toContain('a');
  });
});
