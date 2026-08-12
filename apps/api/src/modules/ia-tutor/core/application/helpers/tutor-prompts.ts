import type { ContextoQuestao } from '../ports/ia-engine.port';
import type { ContextoTrilhaTutor } from './trilha-tutor.helper';
import { buildTrilhaContextBlock } from './trilha-tutor.helper';

export type ContextoAlunoMetricas = {
  simuladosConcluidos: number;
  questoesRespondidas: number;
  mediaGeralPercentual: number | null;
  proficiencias: {
    area: string;
    score: number;
    acertos: number;
    totalQuestoes: number;
  }[];
  lacunas: { area: string; score: number; totalQuestoes: number }[];
  ultimoSimulado: {
    area: string;
    acertos: number;
    totalQuestoes: number;
    percentual: number;
    finalizadoEm: Date | null;
  } | null;
};
const NIVEL_LABELS: Record<string, string> = {
  INICIANTE: 'iniciante no ENEM',
  INTERMEDIARIO: 'intermediário no ENEM',
  AVANCADO: 'avançado no ENEM',
};

export function buildTutorContextBlock(contexto?: ContextoAlunoMetricas) {
  if (!contexto || contexto.questoesRespondidas === 0) {
    return '';
  }

  const linhasProficiencia = contexto.proficiencias
    .map(
      (p) =>
        `- ${p.area}: ${p.score}% (${p.acertos}/${p.totalQuestoes} acertos em simulados)`,
    )
    .join('\n');

  const linhasLacunas = contexto.lacunas
    .map((l) => `- ${l.area}: ${l.score}%`)
    .join('\n');

  const ultimo = contexto.ultimoSimulado
    ? `Último simulado: ${contexto.ultimoSimulado.area} — ${contexto.ultimoSimulado.acertos}/${contexto.ultimoSimulado.totalQuestoes} (${contexto.ultimoSimulado.percentual}%).`
    : '';

  return `

Dados reais do aluno na plataforma (use para personalizar respostas):
- Simulados concluídos: ${contexto.simuladosConcluidos}
- Questões respondidas: ${contexto.questoesRespondidas}
- Média geral: ${contexto.mediaGeralPercentual ?? 0}%

Proficiência por área:
${linhasProficiencia}

Maiores lacunas:
${linhasLacunas}
${ultimo}

Quando o aluno perguntar sobre desempenho, lacunas ou o que estudar, priorize estes dados reais em vez de suposições genéricas.`;
}

export function buildTutorSystemPrompt(
  nivelAluno?: string,
  contextoMetricas?: ContextoAlunoMetricas,
  contextoTrilha?: ContextoTrilhaTutor,
) {
  const nivel =
    NIVEL_LABELS[nivelAluno ?? 'INICIANTE'] ?? 'estudante do ensino médio';

  return `Você é o tutor IA do ENEM+, uma plataforma educacional brasileira.
Seu papel é ajudar estudantes a entender questões do ENEM e montar trilhas de estudo personalizadas.

Regras:
- Responda sempre em português brasileiro, claro e encorajador.
- Adapte a linguagem para um aluno ${nivel}.
- Não invente fórmulas, datas ou fatos — se não tiver certeza, diga.
- Use exemplos simples quando ajudar na compreensão.
- Seja objetivo: 2 a 4 parágrafos curtos, salvo se o aluno pedir mais detalhe.
- Não revele gabarito de imediato em simulados em andamento — aqui o contexto já inclui o gabarito para explicar o erro após a resposta.
- Você NÃO cria simulados na plataforma. Se o aluno pedir um simulado, explique que ele deve ir em **Simulados → Novo simulado** ou usar a **Trilha** (simulado focado na lacuna). Você pode sugerir área e quantidade de questões.
- Sobre "o que mais cai no ENEM": use padrões históricos conhecidos (funções, geometria, estatística em Matemática etc.), mas deixe claro que não há previsão garantida do que cairá "este ano".
- Ao falar de disciplinas, use gramática correta: "são Filosofia e Atualidades" (plural) ou "é Filosofia" (singular) — nunca "é em Filosofia".
- Se não souber responder com segurança, diga honestamente em vez de inventar.${buildTutorContextBlock(contextoMetricas)}${buildTrilhaContextBlock(contextoTrilha)}`;
}
export function buildDicaQuestaoUserPrompt(contexto: ContextoQuestao) {
  const alternativas = contexto.alternativas
    .map((a) => `${a.letra}) ${a.texto}`)
    .join('\n');

  return `O aluno está fazendo um simulado ENEM e pediu uma DICA sobre esta questão.

${contexto.area ? `Área: ${contexto.area}` : ''}${contexto.disciplina ? ` | Disciplina: ${contexto.disciplina}` : ''}

Enunciado:
${contexto.enunciado}

Alternativas:
${alternativas}

Regras da dica:
- NÃO revele a alternativa correta nem elimine opções de forma óbvia
- Indique o conceito-chave ou estratégia de resolução (2 a 3 frases)
- Seja encorajador e didático`;
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
