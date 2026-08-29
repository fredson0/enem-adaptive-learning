import {
  selecionarAssuntosCoberturaParaPrompt,
  type CoberturaAssuntoResumo,
} from './tutor-cobertura.helper';

const ASSUNTOS: CoberturaAssuntoResumo[] = [
  {
    assuntoId: 'mat-funcoes',
    nome: 'Funções',
    areaSlug: 'matematica',
    dominadas: 2,
    disponiveis: 10,
    percentual: 20,
  },
  {
    assuntoId: 'mat-geometria-plana',
    nome: 'Geometria plana',
    areaSlug: 'matematica',
    dominadas: 8,
    disponiveis: 10,
    percentual: 80,
  },
  {
    assuntoId: 'pt-interpretacao',
    nome: 'Interpretação de texto',
    areaSlug: 'linguagens',
    dominadas: 1,
    disponiveis: 20,
    percentual: 5,
  },
];

describe('selecionarAssuntosCoberturaParaPrompt', () => {
  it('prioriza assuntos com menor percentual', () => {
    const selecionados = selecionarAssuntosCoberturaParaPrompt(ASSUNTOS, {
      limit: 2,
    });

    expect(selecionados.map((item) => item.assuntoId)).toEqual([
      'pt-interpretacao',
      'mat-funcoes',
    ]);
  });

  it('filtra por área quando informada', () => {
    const selecionados = selecionarAssuntosCoberturaParaPrompt(ASSUNTOS, {
      areaSlug: 'matematica',
      limit: 5,
    });

    expect(selecionados.every((item) => item.areaSlug === 'matematica')).toBe(
      true,
    );
  });

  it('coloca assunto inferido em primeiro lugar', () => {
    const selecionados = selecionarAssuntosCoberturaParaPrompt(ASSUNTOS, {
      assuntoId: 'mat-geometria-plana',
      limit: 2,
    });

    expect(selecionados[0]?.assuntoId).toBe('mat-geometria-plana');
    expect(selecionados).toHaveLength(2);
  });
});
