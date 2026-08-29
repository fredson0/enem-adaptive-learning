import { AreaEnem } from '@generated/prisma';
import type { ContextoQuestao } from '../ports/ia-engine.port';
import type { ContextoTrilhaTutor } from './trilha-tutor.helper';
import { buildTrilhaContextBlock } from './trilha-tutor.helper';
import { labelAreaEnem, slugAreaEnem } from '../../../../metricas/core/application/helpers/area-enem-labels';
import {
  REGRAS_EXPLICAR_ASSUNTO,
  REGRAS_FORMATO_RESPOSTA,
} from './tutor-formato.helper';

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

export type FrequenciaDisciplina = {
  disciplina: string;
  area: AreaEnem;
  total: number;
};

const NIVEL_LABELS: Record<string, string> = {
  INICIANTE: 'iniciante no ENEM',
  INTERMEDIARIO: 'intermediário no ENEM',
  AVANCADO: 'avançado no ENEM',
};

const AREA_PROMPT_BLOCKS: Record<AreaEnem, string> = {
  [AreaEnem.MATEMATICA]: `
Foco atual: Matemática e suas Tecnologias.
- Priorize raciocínio lógico, álgebra, funções, geometria e estatística.
- Mostre passos de resolução em texto corrido quando relevante.`,
  [AreaEnem.LINGUAGENS]: `
Foco atual: Linguagens, Códigos e suas Tecnologias.
- Priorize interpretação de texto, coesão, gramática normativa e leitura crítica.
- Em língua estrangeira, explique vocabulário e estratégias de compreensão.`,
  [AreaEnem.HUMANAS]: `
Foco atual: Ciências Humanas e suas Tecnologias.
- Priorize contexto histórico, geográfico, filosófico e sociológico.
- Relacione conceitos a cotidiano e interpretação de mapas, gráficos e textos.`,
  [AreaEnem.NATUREZA]: `
Foco atual: Ciências da Natureza e suas Tecnologias.
- Priorize Física, Química e Biologia com foco em fenômenos e interpretação de dados.
- Use unidades do SI e explique o raciocínio por trás de fórmulas.`,
};

const PRODUTO_ENEM_PLUS = `
Como funciona o ENEM+ (use para dúvidas sobre a plataforma):
- Progresso: mostra cobertura real — cada questão conta uma vez quando você acerta.
- Trilha: plano por área com etapas (orientação, treino, simulado, revisão).
- Simulados: Treino (gabarito após cada resposta), Modalidade (por área) e Cronometrado.
- Tutor IA: consome tokens diários; foto de questão custa 2 tokens; PDF explicativo custa 2.
- PDF de questões: questões reais do banco, sem custo de tokens IA.
- Para criar simulado: Simulados → Novo treino, ou peça aqui "10 questões de matemática".`;

const ESCOPO_ENEM = `
Escopo OBRIGATÓRIO — recuse educadamente qualquer pedido fora do ENEM:
- Só responda sobre: conteúdos do ENEM, simulados, trilha, progresso, redação (orientação), vestibular e estudo para prova.
- NÃO responda sobre: programação, código, tecnologia, apps, carreira em TI, receitas, entretenimento ou assuntos sem relação com estudo para o ENEM.
- Se o aluno pedir algo fora do escopo, explique que você é tutor do ENEM+ e redirecione para estudo.`;

export function detectarAreaEnem(mensagem: string): AreaEnem | null {
  const t = mensagem
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (/\b(matematica|fun[cç][aã]o|geometria|algebra|estatistica|logaritmo)\b/.test(t)) {
    return AreaEnem.MATEMATICA;
  }
  if (/\b(linguagens|portugu[eê]s|interpreta[cç][aã]o|literatura|ingl[eê]s|espanhol|reda[cç][aã]o)\b/.test(t)) {
    return AreaEnem.LINGUAGENS;
  }
  if (/\b(humanas|hist[oó]ria|geografia|filosofia|sociologia|atualidades)\b/.test(t)) {
    return AreaEnem.HUMANAS;
  }
  if (/\b(natureza|f[ií]sica|qu[ií]mica|biologia|eletromagnetismo|gen[eé]tica)\b/.test(t)) {
    return AreaEnem.NATUREZA;
  }

  return null;
}

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

export function buildFrequenciaTemasBlock(
  frequencias: FrequenciaDisciplina[],
  areaFiltro?: AreaEnem | null,
) {
  if (frequencias.length === 0) return '';

  const titulo = areaFiltro
    ? `Disciplinas com mais questões no banco ENEM+ (${labelAreaEnem(areaFiltro)}):`
    : 'Disciplinas com mais questões no banco ENEM+ (todas as áreas):';

  const linhas = frequencias
    .slice(0, 12)
    .map(
      (item, index) =>
        `${index + 1}. ${item.disciplina} (${labelAreaEnem(item.area)}): ${item.total} questões`,
    )
    .join('\n');

  return `

${titulo}
${linhas}

Use estes dados reais do banco quando o aluno perguntar "o que mais cai". Deixe claro que isso reflete o banco da plataforma, não uma previsão oficial do INEP para o próximo exame.`;
}

export function buildTutorSystemPrompt(
  nivelAluno?: string,
  contextoMetricas?: ContextoAlunoMetricas,
  contextoTrilha?: ContextoTrilhaTutor,
  options?: {
    areaEnem?: AreaEnem | null;
    frequencias?: FrequenciaDisciplina[];
    incluirProduto?: boolean;
    pedidoExplicacao?: boolean;
  },
) {
  const nivel =
    NIVEL_LABELS[nivelAluno ?? 'INICIANTE'] ?? 'estudante do ensino médio';

  const areaBlock =
    options?.areaEnem != null ? AREA_PROMPT_BLOCKS[options.areaEnem] : '';

  const produtoBlock =
    options?.incluirProduto !== false ? PRODUTO_ENEM_PLUS : '';

  const frequenciaBlock = options?.frequencias?.length
    ? buildFrequenciaTemasBlock(options.frequencias, options.areaEnem)
    : '';

  const explicacaoBlock = options?.pedidoExplicacao
    ? `\n${REGRAS_EXPLICAR_ASSUNTO}`
    : '';

  return `Você é o tutor IA do ENEM+, uma plataforma educacional brasileira.
Seu papel é ajudar estudantes a entender conteúdos do ENEM e montar trilhas de estudo personalizadas.
${ESCOPO_ENEM}
${REGRAS_FORMATO_RESPOSTA}

Regras pedagógicas:
- Responda sempre em português brasileiro, claro e encorajador.
- Adapte a linguagem para um aluno ${nivel}.
- Não invente fórmulas, datas ou fatos — se não tiver certeza, diga.
- Use exemplos simples quando ajudar na compreensão.
- Quando explicar um tema, seja completo e didático — não responda só com uma definição superficial.
- Para dúvidas pontuais, 2 a 4 parágrafos curtos bastam; para "me explica X", use a estrutura de explicação completa abaixo.
- Não revele gabarito de imediato em simulados em andamento — aqui o contexto já inclui o gabarito para explicar o erro após a resposta.
- Se o aluno pedir um simulado ou treino ("10 questões de matemática"), confirme que pode gerar e oriente aguardar — a plataforma montará automaticamente quando detectar esse pedido.
- Sobre "o que mais cai no ENEM": use os dados do banco quando disponíveis abaixo; complemente com padrões históricos conhecidos, mas deixe claro que não há previsão garantida do INEP.
- Ao falar de disciplinas, use gramática correta: "são Filosofia e Atualidades" (plural) ou "é Filosofia" (singular) — nunca "é em Filosofia".
- Se o aluno pedir um PDF explicativo, oriente-o ao botão "PDF explicativo" abaixo da resposta (custa 2 tokens IA).
- Se pedir questões ou prova em PDF, oriente-o ao botão "PDF de questões" (questões reais do banco, sem custo de tokens).
- Se não souber responder com segurança, diga honestamente em vez de inventar.
${explicacaoBlock}${areaBlock}${produtoBlock}${buildTutorContextBlock(contextoMetricas)}${buildTrilhaContextBlock(contextoTrilha)}${frequenciaBlock}`;
}

export function buildVisionSystemPrompt(nivelAluno?: string) {
  const nivel =
    NIVEL_LABELS[nivelAluno ?? 'INICIANTE'] ?? 'estudante do ensino médio';

  return `Você é o tutor IA do ENEM+ analisando uma foto enviada pelo aluno.
${ESCOPO_ENEM}
${REGRAS_FORMATO_RESPOSTA}

Regras para imagens:
- Se for foto de questão ENEM ou exercício escolar: leia o enunciado, identifique a área (Matemática, Linguagens, Humanas ou Natureza) e explique o raciocínio passo a passo, sem revelar gabarito se o aluno estiver em simulado.
- Se for gráfico, tabela ou fórmula: interprete em contexto de estudo para o ENEM.
- Se a imagem NÃO for de estudo/ENEM (meme, print de código, selfie etc.): recuse educadamente e peça uma foto de questão ou material de estudo.
- Responda em português brasileiro, adaptado para aluno ${nivel}, de forma completa e didática.`;
}

export function buildDicaQuestaoUserPrompt(
  contexto: ContextoQuestao,
  nivelAluno?: string,
) {
  const alternativas = contexto.alternativas
    .map((a) => `${a.letra}) ${a.texto}`)
    .join('\n');

  const nivel =
    NIVEL_LABELS[nivelAluno ?? 'INICIANTE'] ?? 'estudante do ensino médio';

  return `O aluno (${nivel}) está fazendo um simulado ENEM e pediu uma DICA sobre esta questão.

${contexto.area ? `Área: ${contexto.area}` : ''}${contexto.disciplina ? ` | Disciplina: ${contexto.disciplina}` : ''}

Enunciado:
${contexto.enunciado}

Alternativas:
${alternativas}

Regras da dica:
- NÃO revele a alternativa correta nem elimine opções de forma óbvia
- Indique o conceito-chave ou estratégia de resolução (2 a 3 frases)
- Adapte ao nível do aluno
- Seja encorajador e didático
- Texto corrido, sem Markdown nem asteriscos`;
}

export function buildExplicarErroUserPrompt(
  contexto: ContextoQuestao,
  perguntaExtra?: string,
  trilhaHref?: string,
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

  const trilha = trilhaHref
    ? `\n\nAo final, sugira revisar na trilha: ${trilhaHref}${contexto.disciplina ? ` (disciplina: ${contexto.disciplina})` : ''}.`
    : '';

  return `Explique por que a resposta do aluno está incorreta e ajude a entender o raciocínio correto.
Use texto corrido, passo a passo quando necessário, sem Markdown nem asteriscos.

${contexto.area ? `Área: ${contexto.area}` : ''}${contexto.disciplina ? ` | Disciplina: ${contexto.disciplina}` : ''}

Enunciado:
${contexto.enunciado}

Alternativas:
${alternativas}

Gabarito correto: ${contexto.gabarito}${marcada}${extra}${trilha}`;
}

export function montarHrefTrilhaArea(area?: string): string | undefined {
  if (!area) return undefined;
  const slug = slugAreaEnem(area);
  return `/trilha/${slug}`;
}

export function formatarRespostaFrequenciaTemas(
  frequencias: FrequenciaDisciplina[],
  areaFiltro?: AreaEnem | null,
): string {
  if (frequencias.length === 0) {
    return 'Ainda não há questões suficientes no banco para montar um ranking de disciplinas.';
  }

  const titulo = areaFiltro
    ? `Disciplinas com mais questões no banco (${labelAreaEnem(areaFiltro)}):`
    : 'Disciplinas com mais questões no banco ENEM+ (todas as áreas):';

  const lista = frequencias
    .slice(0, 10)
    .map(
      (item, index) =>
        `${index + 1}. ${item.disciplina} (${labelAreaEnem(item.area)}) — ${item.total} questões`,
    )
    .join('\n');

  return `${titulo}\n\n${lista}\n\nIsso reflete o banco de questões da plataforma, não uma previsão oficial do INEP. Use a Trilha para focar nos assuntos onde você ainda tem lacunas.`;
}

export type LacunaResumoTutor = {
  label: string;
  score: number;
  prioridade: string;
  mensagem: string;
  simuladoSugerido: { area: string; quantidade: number };
};

export function formatarRespostaLacunas(input: {
  metaSemanal: string;
  lacunas: LacunaResumoTutor[];
}): string {
  if (input.lacunas.length === 0) {
    return 'Faça seu primeiro simulado de treino (5 questões) para eu mapear suas lacunas por área.';
  }

  const lista = input.lacunas
    .map(
      (lacuna, index) =>
        `${index + 1}. ${lacuna.label} — ${lacuna.score}% do banco dominado (${lacuna.prioridade})\n   ${lacuna.mensagem}\n   Sugestão: simulado focado com ${lacuna.simuladoSugerido.quantidade} questões em /simulados/treino/novo?area=${lacuna.simuladoSugerido.area}&quantidade=${lacuna.simuladoSugerido.quantidade}`,
    )
    .join('\n\n');

  return `Suas maiores lacunas (dados reais da plataforma):\n\n${lista}\n\nMeta desta semana: ${input.metaSemanal}\n\nVeja detalhes em /trilha ou /progresso.`;
}

export function formatarRespostaProgresso(
  contexto: ContextoAlunoMetricas,
): string {
  if (contexto.questoesRespondidas === 0) {
    return 'Você ainda não concluiu simulados. Comece com um treino de 5 questões em /simulados/treino/novo?quantidade=5 para ver seu progresso por área.';
  }

  const linhas = contexto.proficiencias
    .map(
      (item) =>
        `• ${item.area}: ${item.score}% de cobertura (${item.acertos}/${item.totalQuestoes} acertos em simulados)`,
    )
    .join('\n');

  const ultimo = contexto.ultimoSimulado
    ? `\nÚltimo simulado: ${contexto.ultimoSimulado.area} — ${contexto.ultimoSimulado.acertos}/${contexto.ultimoSimulado.totalQuestoes} (${contexto.ultimoSimulado.percentual}%).`
    : '';

  const lacunas = contexto.lacunas
    .map((item) => `• ${item.area}: ${item.score}%`)
    .join('\n');

  return `Seu progresso no ENEM+ (dados reais):

Simulados concluídos: ${contexto.simuladosConcluidos}
Questões respondidas: ${contexto.questoesRespondidas}
Média geral: ${contexto.mediaGeralPercentual ?? 0}%

Cobertura por área:
${linhas}

Maiores lacunas:
${lacunas}${ultimo}

Acompanhe gráficos em /progresso e seu plano em /trilha.`;
}
