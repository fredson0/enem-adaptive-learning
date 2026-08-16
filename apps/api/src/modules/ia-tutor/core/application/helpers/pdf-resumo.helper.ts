import { getAssuntoById } from '../../../../metricas/core/application/helpers/trilha-assuntos.catalog';

export type PdfResumoGerado = {
  titulo: string;
  subtitulo?: string;
  secoes: {
    titulo: string;
    paragrafos: string[];
    topicos?: string[];
  }[];
  dicaFinal?: string;
};

export const CUSTO_TOKENS_PDF_RESUMO = 2;

export function buildPdfResumoUserPrompt(input: {
  assuntoNome: string;
  areaLabel?: string;
  conteudoBase?: string;
  historicoResumo?: string;
}) {
  const contexto = input.conteudoBase
    ? `\n\nUse como base esta explicação já dada ao aluno (pode reorganizar e expandir, sem contradizer):\n${input.conteudoBase}`
    : '';

  const historico = input.historicoResumo
    ? `\n\nTrecho recente da conversa:\n${input.historicoResumo}`
    : '';

  const area = input.areaLabel ? ` (${input.areaLabel})` : '';

  return `Crie um material de estudo em PDF sobre "${input.assuntoNome}"${area} para um aluno do ENEM.

Retorne APENAS um JSON válido (sem markdown) neste formato:
{
  "titulo": "string",
  "subtitulo": "string opcional",
  "secoes": [
    {
      "titulo": "string",
      "paragrafos": ["parágrafo curto"],
      "topicos": ["item de lista opcional"]
    }
  ],
  "dicaFinal": "string opcional com orientação prática"
}

Regras:
- 3 a 5 seções objetivas (conceitos-chave, fórmulas ou fatos, pegadinhas do ENEM, como revisar).
- Português brasileiro, tom didático.
- Não invente fatos, datas ou fórmulas.
- Foque no que mais cai no ENEM para este tema.
- Parágrafos curtos (2-4 linhas cada).${contexto}${historico}`;
}

export function extrairJsonPdfResumo(texto: string): PdfResumoGerado | null {
  const match = texto.match(/\{[\s\S]*"titulo"[\s\S]*"secoes"[\s\S]*\}/);
  if (!match) return null;

  try {
    const data = JSON.parse(match[0]) as {
      titulo?: string;
      subtitulo?: string;
      secoes?: {
        titulo?: string;
        paragrafos?: string[];
        topicos?: string[];
      }[];
      dicaFinal?: string;
    };

    if (!data.titulo?.trim() || !Array.isArray(data.secoes)) return null;

    const secoes = data.secoes
      .map((secao) => ({
        titulo: secao.titulo?.trim() ?? '',
        paragrafos: Array.isArray(secao.paragrafos)
          ? secao.paragrafos
              .filter((p): p is string => typeof p === 'string')
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
          : [],
        topicos: Array.isArray(secao.topicos)
          ? secao.topicos
              .filter((t): t is string => typeof t === 'string')
              .map((t) => t.trim())
              .filter((t) => t.length > 0)
          : undefined,
      }))
      .filter((secao) => secao.titulo && secao.paragrafos.length > 0);

    if (secoes.length === 0) return null;

    return {
      titulo: data.titulo.trim(),
      subtitulo: data.subtitulo?.trim() || undefined,
      secoes,
      dicaFinal: data.dicaFinal?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

export function resolverNomeAssuntoPdf(input: {
  assuntoId?: string;
  assuntoNome?: string;
  conteudoBase?: string;
}): string | null {
  if (input.assuntoNome?.trim()) {
    return input.assuntoNome.trim();
  }

  if (input.assuntoId) {
    const assunto = getAssuntoById(input.assuntoId);
    if (assunto) return assunto.nome;
  }

  if (input.conteudoBase?.trim()) {
    const linha = input.conteudoBase.trim().split('\n')[0] ?? '';
    if (linha.length >= 4 && linha.length <= 120) {
      return linha.replace(/\.$/, '');
    }
  }

  return null;
}
