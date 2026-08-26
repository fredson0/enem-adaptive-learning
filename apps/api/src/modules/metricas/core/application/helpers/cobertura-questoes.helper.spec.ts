import {
  agregarCoberturaPorArea,
  calcularPercentualCobertura,
  inferirAssuntoId,
  inferirAssuntoIdParaQuestao,
  montarCoberturaResumo,
  questaoCombinaAssunto,
  textoMencionaAssunto,
} from './cobertura-questoes.helper';
import { TRILHA_ASSUNTOS } from './trilha-assuntos.catalog';

type AreaEnem = 'MATEMATICA' | 'LINGUAGENS' | 'HUMANAS' | 'NATUREZA';

describe('cobertura-questoes.helper', () => {
  const assuntoFuncoes = TRILHA_ASSUNTOS.find((item) => item.id === 'mat-funcoes')!;

  it('detecta assunto por nome ou palavra-chave', () => {
    expect(textoMencionaAssunto('revisar funções do 2º grau', assuntoFuncoes)).toBe(
      true,
    );
    expect(textoMencionaAssunto('gráfico de reta', assuntoFuncoes)).toBe(true);
    expect(textoMencionaAssunto('história do brasil colônia', assuntoFuncoes)).toBe(
      false,
    );
  });

  it('combina questão por assuntoId sem depender do texto', () => {
    expect(
      questaoCombinaAssunto(
        {
          assuntoId: 'mat-funcoes',
          disciplina: 'matematica',
          contexto: 'texto genérico',
          introducaoAlternativas: null,
        },
        assuntoFuncoes,
      ),
    ).toBe(true);
  });

  it('infere assuntoId para questão de matemática', () => {
    const assuntoId = inferirAssuntoIdParaQuestao({
      area: 'MATEMATICA' as AreaEnem,
      disciplina: 'matematica',
      contexto: 'Uma função do 2º grau tem gráfico parabólico.',
      introducaoAlternativas: null,
    });

    expect(assuntoId).toBe('mat-funcoes');
  });

  it('infere assuntoId por área quando há palavra-chave', () => {
    expect(inferirAssuntoId('calcular seno e cosseno', 'matematica')).toBe(
      'mat-trigonometria',
    );
  });

  it('calcula percentual de cobertura com uma casa decimal', () => {
    expect(calcularPercentualCobertura(3, 10)).toBe(30);
    expect(calcularPercentualCobertura(1, 3)).toBe(33.3);
    expect(calcularPercentualCobertura(0, 0)).toBe(0);
  });

  it('monta resumo de cobertura', () => {
    expect(montarCoberturaResumo(5, 20, 8)).toEqual({
      dominadas: 5,
      disponiveis: 20,
      tentadas: 8,
      percentual: 25,
    });
  });

  it('agrega dominadas por área', () => {
    const agregado = agregarCoberturaPorArea({
      dominadas: [
        { area: 'MATEMATICA' as AreaEnem },
        { area: 'MATEMATICA' as AreaEnem },
        { area: 'HUMANAS' as AreaEnem },
      ],
      disponiveisPorArea: {
        MATEMATICA: 100,
        LINGUAGENS: 80,
        HUMANAS: 90,
        NATUREZA: 70,
      } as Record<AreaEnem, number>,
    });

    expect(agregado).toEqual([
      { area: 'MATEMATICA', totalQuestoes: 100, acertos: 2 },
      { area: 'LINGUAGENS', totalQuestoes: 80, acertos: 0 },
      { area: 'HUMANAS', totalQuestoes: 90, acertos: 1 },
      { area: 'NATUREZA', totalQuestoes: 70, acertos: 0 },
    ]);
  });
});
