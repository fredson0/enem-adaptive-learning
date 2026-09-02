import { AreaEnem } from '@generated/prisma';
import { parseAreaEnem } from '../../../../questoes/core/application/helpers/area-enem';
import { montarTermosBuscaSimulado } from '../../../../questoes/core/application/helpers/termos-simulado.helper';
import { parseJsonIa } from '../../../../ia-tutor/core/application/helpers/ia-json.helper';

export type PedidoSimuladoInterpretado = {
  area: AreaEnem | null;
  quantidade: number;
  anos: number[] | null;
  termosBusca: string[];
  titulo: string;
  resumo: string;
};

function tentarExtrairJsonSimulado(texto: string): Record<string, unknown> | null {
  return parseJsonIa<Record<string, unknown>>(texto);
}

function inferirAreaDoPedido(pedido: string): AreaEnem | null {
  const texto = pedido.toLowerCase();

  if (/matem[aá]tica|matematica/.test(texto)) return AreaEnem.MATEMATICA;
  if (/linguagens?/.test(texto)) return AreaEnem.LINGUAGENS;
  if (/humanas|hist[oó]ria|geografia|filosofia|sociologia/.test(texto)) {
    return AreaEnem.HUMANAS;
  }
  if (/natureza|f[ií]sica|qu[ií]mica|biologia/.test(texto)) {
    return AreaEnem.NATUREZA;
  }

  return null;
}

export function inferirPlanoDoPedido(pedido: string): PedidoSimuladoInterpretado {
  const quantidadeMatch = pedido.match(/(\d+)\s*quest/i);
  let quantidade = quantidadeMatch ? Number(quantidadeMatch[1]) : 10;
  if (!Number.isFinite(quantidade)) quantidade = 10;
  quantidade = Math.min(Math.max(Math.round(quantidade), 5), 20);

  const area = inferirAreaDoPedido(pedido);
  const termosBusca = montarTermosBuscaSimulado({ pedido, area });

  return {
    area,
    quantidade,
    anos: null,
    termosBusca,
    titulo: 'Simulado personalizado',
    resumo: 'Simulado montado a partir do seu pedido.',
  };
}

function normalizarPlano(raw: Record<string, unknown>): PedidoSimuladoInterpretado {
  const areaRaw = raw.area;
  const area =
    typeof areaRaw === 'string' && areaRaw.trim() && areaRaw.trim() !== 'null'
      ? parseAreaEnem(areaRaw.trim().toLowerCase())
      : null;

  let quantidade = Number(raw.quantidade);
  if (!Number.isFinite(quantidade)) quantidade = 10;
  quantidade = Math.min(Math.max(Math.round(quantidade), 5), 20);

  const anosRaw = raw.anos;
  const anos =
    Array.isArray(anosRaw) && anosRaw.length > 0
      ? anosRaw
          .map((a) => Number(a))
          .filter((a) => Number.isFinite(a) && a >= 2009 && a <= 2030)
      : null;

  const termosBusca = Array.isArray(raw.termosBusca)
    ? raw.termosBusca
        .filter((t): t is string => typeof t === 'string')
        .map((t) => t.trim())
        .filter((t) => t.length >= 2)
        .slice(0, 8)
    : [];

  const titulo =
    typeof raw.titulo === 'string' && raw.titulo.trim()
      ? raw.titulo.trim().slice(0, 120)
      : 'Simulado personalizado';

  const resumo =
    typeof raw.resumo === 'string' && raw.resumo.trim()
      ? raw.resumo.trim().slice(0, 300)
      : 'Simulado montado a partir do seu pedido.';

  return {
    area,
    quantidade,
    anos: anos?.length ? anos : null,
    termosBusca,
    titulo,
    resumo,
  };
}

export function buildInterpretarPedidoSimuladoPrompt(pedido: string) {
  return `Você é o planejador de simulados do ENEM+IA. Converta o pedido do aluno em filtros para buscar questões REAIS no banco (não invente questões).

Retorne APENAS um JSON válido, sem markdown, com aspas duplas em todos os valores string, neste formato:
{
  "area": "matematica" | "linguagens" | "humanas" | "natureza" | null,
  "quantidade": número entre 5 e 20,
  "anos": [lista de anos] ou null para TODOS os anos disponíveis,
  "termosBusca": ["palavras", "sinônimos"] para buscar no enunciado,
  "titulo": "título curto do simulado",
  "resumo": "1 frase explicando o que será sorteado"
}

Regras:
- Se o aluno pedir "todos os anos", "vários anos" ou não citar ano, use anos: null
- Para assuntos, preencha termosBusca com palavras-chave curtas (ex.: ["função", "domínio"]), nunca frases longas
- Se pedir "o que mais cai", use termos dos assuntos mais frequentes do ENEM na área (função, geometria, estatística em matemática)
- Se o aluno citar uma área (matemática, linguagens etc.), preencha "area" corretamente — nunca null nesse caso
- quantidade padrão: 10

Pedido do aluno:
${pedido.trim()}`;
}

export function parsePedidoSimuladoJson(
  texto: string,
  pedidoFallback?: string,
): PedidoSimuladoInterpretado {
  const raw = tentarExtrairJsonSimulado(texto);

  if (raw) {
    const plano = normalizarPlano(raw);
    const fallback = pedidoFallback ? inferirPlanoDoPedido(pedidoFallback) : null;
    const area = plano.area ?? fallback?.area ?? null;

    return {
      ...plano,
      area,
      termosBusca: montarTermosBuscaSimulado({
        termosIa: plano.termosBusca,
        pedido: pedidoFallback,
        area,
      }),
    };
  }

  if (pedidoFallback) {
    return inferirPlanoDoPedido(pedidoFallback);
  }

  throw new Error('A IA não retornou um plano de simulado válido.');
}
