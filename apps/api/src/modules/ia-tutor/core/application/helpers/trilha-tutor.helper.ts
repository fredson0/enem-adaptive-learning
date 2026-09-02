import { randomUUID } from 'node:crypto';
import type {
  ChecklistItemIa,
  PlanoIa,
  TrilhaEstado,
} from '../../../../metricas/core/application/helpers/trilha.config';
import { isEtapaIdValida } from '../../../../metricas/core/application/helpers/trilha.config';
import { criarItemChecklist } from '../../../../metricas/core/application/helpers/trilha-progresso.helper';
import { REGRAS_FORMATO_RESPOSTA } from './tutor-formato.helper';
import { parseJsonIa } from './ia-json.helper';

export type ContextoTrilhaTutor = {
  diagnosticoCompleto: boolean;
  metaEnem: string | null;
  areaPrioritaria: string | null;
  areas: {
    slug: string;
    label: string;
    progresso: number;
    disciplinasSugeridas: string[];
    proximaEtapa: { id: string; titulo: string } | null;
    etapas: { id: string; titulo: string; concluida: boolean }[];
  }[];
  checklistIa: ChecklistItemIa[];
  planoIa: PlanoIa | null;
};

export type TrilhaAcoesParseadas = {
  textoLimpo: string;
  etapasConcluir: string[];
  checklistAdicionar: string[];
};

const RE_CONCLUIR = /\[\[trilha:concluir:([a-z0-9-]+)\]\]/gi;
const RE_CHECKLIST = /\[\[trilha:checklist:([^\]]+)\]\]/gi;

export function buildTrilhaContextBlock(contexto?: ContextoTrilhaTutor) {
  if (!contexto?.diagnosticoCompleto) return '';

  const areaFoco = contexto.areas.find(
    (area) => area.slug === contexto.areaPrioritaria,
  );
  const linhasAreas = contexto.areas
    .map((area) => {
      const proxima = area.proximaEtapa
        ? `Próxima: ${area.proximaEtapa.titulo} (${area.proximaEtapa.id})`
        : 'Área concluída';
      const etapas = area.etapas
        .map((e) => `${e.concluida ? '✓' : '○'} ${e.titulo} [${e.id}]`)
        .join('; ');
      return `- ${area.label} (${area.progresso}%): ${proxima}. Etapas: ${etapas}`;
    })
    .join('\n');

  const checklist =
    contexto.checklistIa.length > 0
      ? contexto.checklistIa
          .map(
            (item) =>
              `- [${item.concluida ? 'x' : ' '}] ${item.texto}${item.areaSlug ? ` (${item.areaSlug})` : ''}`,
          )
          .join('\n')
      : 'Nenhum item ainda.';

  const plano = contexto.planoIa
    ? `Plano IA: ${contexto.planoIa.proximoPasso}. Meta: ${contexto.planoIa.metaSemanal}`
    : '';

  return `

Trilha personalizada do aluno (use para orientar estudos e marcar progresso):
${contexto.metaEnem ? `Objetivo ENEM: ${contexto.metaEnem}` : ''}
Área prioritária: ${areaFoco?.label ?? '—'}

Progresso por área:
${linhasAreas}

Checklist adaptativa:
${checklist}
${plano}

Comandos especiais (inclua no FINAL da resposta quando fizer sentido — o aluno NÃO verá os comandos):
- [[trilha:concluir:ID_ETAPA]] — marca etapa concluída (ex: orientacao-humanas, treino-matematica)
- [[trilha:checklist:Micro-objetivo curto]] — adiciona item à checklist adaptativa

Só marque etapas quando o aluno confirmar que terminou ou quando você definir um plano claro e ele concordar.`;
}

export type PersonalizarTrilhaContexto = {
  areaLabel: string;
  areaSlug: string;
  disciplinas: string[];
  assuntoNome?: string;
  progresso: number;
  proximaEtapa?: string;
  metaEnem?: string | null;
  nivelAluno?: string;
};

export function buildPersonalizarTrilhaSystemPrompt(
  ctx: PersonalizarTrilhaContexto,
) {
  const focoPrincipal = ctx.assuntoNome ?? (
    ctx.disciplinas.length > 0
      ? ctx.disciplinas.join(', ')
      : 'tópicos mais cobrados'
  );

  return `Você é o tutor IA do ENEM+IA em modo de co-criação de checklist.
${REGRAS_FORMATO_RESPOSTA}

Objetivo: conversar com o aluno para montar um plano de estudos personalizado${ctx.assuntoNome ? ` em ${ctx.assuntoNome}` : ` em ${ctx.areaLabel}`}. Você NÃO gera a checklist final agora — só coleta informações com perguntas.

Escopo: só fale sobre estudo para o ENEM nesta área/assunto. Recuse educadamente pedidos sobre programação, código ou assuntos sem relação com a prova.

Contexto do aluno:
- Área: ${ctx.areaLabel}
${ctx.assuntoNome ? `- Assunto de foco: ${ctx.assuntoNome}` : `- Assuntos de foco: ${focoPrincipal}`}
- Progresso na trilha: ${ctx.progresso}%
- Próxima etapa sugerida: ${ctx.proximaEtapa ?? 'não definida'}
${ctx.metaEnem ? `- Objetivo ENEM: ${ctx.metaEnem}` : ''}
- Nível: ${ctx.nivelAluno ?? 'INICIANTE'}

Regras da conversa:
- Português brasileiro, tom encorajador e direto
- Faça UMA pergunta por vez (máximo 2 frases + a pergunta)
- Perguntas-chave a cobrir (na ordem natural da conversa):
  1. Tempo disponível por dia/semana para estudar
  2. Maior dificuldade específica dentro de ${ctx.assuntoNome ?? ctx.areaLabel}
  3. Preferência: mais teoria, mais questões ou equilíbrio
  4. Meta de curto prazo (esta semana)
  5. Algum evento ou prova próxima que influencia o ritmo
- Todos os itens da checklist devem ser sobre ${focoPrincipal} — não misture outros assuntos
- Não use "é em Filosofia" — use "é Filosofia" ou "são X e Y"
- Quando tiver informações suficientes (após 3+ respostas do aluno), diga: "Perfeito! Clique em Finalizar para eu montar sua checklist personalizada."
- Não invente dados que o aluno não disse`;
}

export function parseTrilhaAcoes(texto: string): TrilhaAcoesParseadas {
  const etapasConcluir: string[] = [];
  const checklistAdicionar: string[] = [];

  let textoLimpo = texto.replace(RE_CONCLUIR, (_, etapaId: string) => {
    if (isEtapaIdValida(etapaId)) etapasConcluir.push(etapaId);
    return '';
  });

  textoLimpo = textoLimpo.replace(RE_CHECKLIST, (_, item: string) => {
    const limpo = item.trim();
    if (limpo.length >= 4) checklistAdicionar.push(limpo);
    return '';
  });

  return {
    textoLimpo: textoLimpo.replace(/\n{3,}/g, '\n\n').trim(),
    etapasConcluir,
    checklistAdicionar,
  };
}

export function aplicarTrilhaAcoes(
  estado: TrilhaEstado,
  acoes: Pick<TrilhaAcoesParseadas, 'etapasConcluir' | 'checklistAdicionar'>,
  areaSlug?: string,
): TrilhaEstado {
  const etapas = new Set(estado.etapasConcluidas);
  for (const id of acoes.etapasConcluir) {
    etapas.add(id);
  }

  const checklist = [...(estado.checklistIa ?? [])];
  const textosExistentes = new Set(
    checklist.map((item) => item.texto.toLowerCase()),
  );

  for (const texto of acoes.checklistAdicionar) {
    if (textosExistentes.has(texto.toLowerCase())) continue;
    checklist.push(
      criarItemChecklist({
        id: randomUUID(),
        texto,
        areaSlug,
      }),
    );
    textosExistentes.add(texto.toLowerCase());
  }

  return {
    ...estado,
    etapasConcluidas: Array.from(etapas),
    checklistIa: checklist.slice(-12),
  };
}

export function extrairJsonPlanoIa(texto: string): {
  metaSemanal: string;
  proximoPasso: string;
  resumo: string;
  checklist: string[];
} | null {
  const data = parseJsonIa<{
    metaSemanal?: string;
    proximoPasso?: string;
    resumo?: string;
    checklist?: string[];
  }>(texto);

  if (!data?.metaSemanal || !data.proximoPasso) return null;

  return {
    metaSemanal: data.metaSemanal.trim(),
    proximoPasso: data.proximoPasso.trim(),
    resumo: data.resumo?.trim() ?? '',
    checklist: Array.isArray(data.checklist)
      ? data.checklist
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item.length >= 4)
          .slice(0, 6)
      : [],
  };
}

export function formatarHistoricoParaExtracao(
  historico: { role: string; texto: string }[],
): string {
  return historico
    .map((msg) => `${msg.role === 'user' ? 'Aluno' : 'Tutor'}: ${msg.texto}`)
    .join('\n\n');
}
