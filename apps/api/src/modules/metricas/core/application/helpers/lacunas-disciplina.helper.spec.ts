import {
  agregarLacunasPorDisciplina,
  mesclarDisciplinasSugeridas,
  selecionarDisciplinasPorArea,
  type RespostaDisciplinaBruta,
} from './lacunas-disciplina.helper';

type AreaEnem = RespostaDisciplinaBruta['area'];

const resposta = (
  disciplina: string,
  area: RespostaDisciplinaBruta['area'],
  correto: boolean,
): RespostaDisciplinaBruta => ({
  disciplina,
  area,
  correto,
});

describe('agregarLacunasPorDisciplina', () => {
  it('prioriza disciplinas com mais erros', () => {
    const resultado = agregarLacunasPorDisciplina([
      resposta('funções', 'MATEMATICA', false),
      resposta('funções', 'MATEMATICA', false),
      resposta('funções', 'MATEMATICA', true),
      resposta('geometria', 'MATEMATICA', false),
      resposta('geometria', 'MATEMATICA', true),
    ]);

    expect(resultado[0]?.disciplina).toBe('Funções');
    expect(resultado[0]?.erros).toBe(2);
    expect(resultado[0]?.slug).toBe('matematica');
  });

  it('ignora disciplinas sem erro suficiente', () => {
    const resultado = agregarLacunasPorDisciplina([
      resposta('física', 'NATUREZA', true),
      resposta('física', 'NATUREZA', true),
    ]);

    expect(resultado).toHaveLength(0);
  });
});

describe('selecionarDisciplinasPorArea', () => {
  it('filtra por slug da área', () => {
    const lacunas = agregarLacunasPorDisciplina([
      resposta('funções', 'MATEMATICA', false),
      resposta('funções', 'MATEMATICA', false),
      resposta('interpretação', 'LINGUAGENS', false),
      resposta('interpretação', 'LINGUAGENS', false),
    ]);

    expect(selecionarDisciplinasPorArea(lacunas, 'matematica')).toEqual([
      'Funções',
    ]);
  });
});

describe('mesclarDisciplinasSugeridas', () => {
  it('mantém ordem real > declarada > fallback sem duplicar', () => {
    expect(
      mesclarDisciplinasSugeridas(
        ['Funções'],
        ['funções', 'Geometria'],
        ['Probabilidade'],
      ),
    ).toEqual(['Funções', 'Geometria', 'Probabilidade']);
  });
});
