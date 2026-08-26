import {
  enriquecerInputModelTier,
  isAreaExatas,
  montarCandidatosModelo,
  resolverModelTier,
} from './ia-model-tier.helper';

const MATEMATICA = 'MATEMATICA' as const;
const NATUREZA = 'NATUREZA' as const;
const HUMANAS = 'HUMANAS' as const;
const LINGUAGENS = 'LINGUAGENS' as const;

describe('ia-model-tier.helper', () => {
  it('identifica Matemática e Natureza como exatas', () => {
    expect(isAreaExatas(MATEMATICA)).toBe(true);
    expect(isAreaExatas(NATUREZA)).toBe(true);
    expect(isAreaExatas(HUMANAS)).toBe(false);
    expect(isAreaExatas(LINGUAGENS)).toBe(false);
  });

  it('resolve tier exatas a partir da área', () => {
    expect(resolverModelTier({ areaEnem: MATEMATICA })).toBe('exatas');
    expect(resolverModelTier({ areaEnem: LINGUAGENS })).toBe('default');
  });

  it('usa modelo exatas quando configurado', () => {
    const candidatos = montarCandidatosModelo({
      tier: 'exatas',
      configuredDefault: 'modelo-pequeno',
      configuredExatas: 'modelo-grande',
      fallbacks: ['fb1', 'fb2'],
    });
    expect(candidatos[0]).toBe('modelo-grande');
  });

  it('enriquece input com modelTier exatas', () => {
    const enriched = enriquecerInputModelTier({
      texto: 'teste',
      areaEnem: NATUREZA,
    });
    expect(enriched.modelTier).toBe('exatas');
  });
});
