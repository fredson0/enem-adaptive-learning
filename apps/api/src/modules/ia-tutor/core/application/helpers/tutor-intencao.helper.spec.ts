import { classificarIntencaoTutor } from './tutor-intencao.helper';

describe('classificarIntencaoTutor', () => {
  it('detecta gerar simulado', () => {
    expect(classificarIntencaoTutor('Monta 10 questões de matemática')).toBe(
      'gerar_simulado',
    );
  });

  it('detecta frequência de temas', () => {
    expect(classificarIntencaoTutor('O que mais cai em matemática?')).toBe(
      'frequencia_temas',
    );
  });

  it('detecta lacunas do aluno', () => {
    expect(classificarIntencaoTutor('Quais são minhas maiores lacunas?')).toBe(
      'minhas_lacunas',
    );
    expect(classificarIntencaoTutor('Onde estou mais fraco?')).toBe(
      'minhas_lacunas',
    );
  });

  it('detecta progresso do aluno', () => {
    expect(classificarIntencaoTutor('Como está meu desempenho?')).toBe(
      'meu_progresso',
    );
    expect(classificarIntencaoTutor('Resumo do meu progresso')).toBe(
      'meu_progresso',
    );
  });

  it('detecta dúvidas sobre a plataforma', () => {
    expect(classificarIntencaoTutor('Como funciona a trilha?')).toBe(
      'produto_plataforma',
    );
  });

  it('usa chat livre como fallback', () => {
    expect(classificarIntencaoTutor('O que é mitose?')).toBe('chat_livre');
  });
});
