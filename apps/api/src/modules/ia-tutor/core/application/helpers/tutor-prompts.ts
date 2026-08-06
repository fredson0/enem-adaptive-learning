import type { ContextoQuestao } from '../ports/ia-engine.port';

const NIVEL_LABELS: Record<string, string> = {
  INICIANTE: 'iniciante no ENEM',
  INTERMEDIARIO: 'intermediário no ENEM',
  AVANCADO: 'avançado no ENEM',
};

export function buildTutorSystemPrompt(nivelAluno?: string) {
  const nivel =
    NIVEL_LABELS[nivelAluno ?? 'INICIANTE'] ?? 'estudante do ensino médio';

  return `Você é o tutor IA do ENEM+, uma plataforma educacional brasileira.
Seu papel é ajudar estudantes a entender questões do ENEM de forma didática.

Regras:
- Responda sempre em português brasileiro, claro e encorajador.
- Adapte a linguagem para um aluno ${nivel}.
- Não invente fórmulas, datas ou fatos — se não tiver certeza, diga.
- Use exemplos simples quando ajudar na compreensão.
- Seja objetivo: 2 a 4 parágrafos curtos, salvo se o aluno pedir mais detalhe.
- Não revele gabarito de imediato em simulados em andamento — aqui o contexto já inclui o gabarito para explicar o erro após a resposta.`;
}

export function buildExplicarErroUserPrompt(
  contexto: ContextoQuestao,
  perguntaExtra?: string,
) {
  const alternativas = contexto.alternativas
    .map((a) => `${a.letra}) ${a.texto}`)
    .join('\n');

  const marcada = contexto.alternativaMarcada
    ? `\nAlternativa que o aluno marcou: ${contexto.alternativaMarcada}`
    : '';

  const extra = perguntaExtra?.trim()
    ? `\n\nPergunta adicional do aluno: ${perguntaExtra.trim()}`
    : '';

  return `Explique por que a resposta do aluno está incorreta e ajude a entender o raciocínio correto.

${contexto.area ? `Área: ${contexto.area}` : ''}${contexto.disciplina ? ` | Disciplina: ${contexto.disciplina}` : ''}

Enunciado:
${contexto.enunciado}

Alternativas:
${alternativas}

Gabarito correto: ${contexto.gabarito}${marcada}${extra}`;
}
