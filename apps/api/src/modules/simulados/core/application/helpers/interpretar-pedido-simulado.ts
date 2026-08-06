import { AreaEnem } from '@generated/prisma';
import { parseAreaEnem } from '../../../../questoes/core/application/helpers/area-enem';

export type PedidoSimuladoInterpretado = {
  area: AreaEnem | null;
  quantidade: number;
  anos: number[] | null;
  termosBusca: string[];
  titulo: string;
  resumo: string;
};

export function buildInterpretarPedidoSimuladoPrompt(pedido: string) {
  return `Você é o planejador de simulados do ENEM+. Converta o pedido do aluno em filtros para buscar questões REAIS no banco (não invente questões).

Retorne APENAS um JSON válido, sem markdown, neste formato:
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
- Para assuntos (funções, eletromagnetismo, interpretação de texto), preencha termosBusca com sinônimos em português (mín. 2 termos quando possível)
- quantidade padrão: 10
- area null só se o pedido for realmente misto entre áreas (raro)

Pedido do aluno:
${pedido.trim()}`;
}

export function parsePedidoSimuladoJson(texto: string): PedidoSimuladoInterpretado {
  const match = texto.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('A IA não retornou um plano de simulado válido.');
  }

  const raw = JSON.parse(match[0]) as Record<string, unknown>;

  const areaRaw = raw.area;
  const area =
    typeof areaRaw === 'string' && areaRaw.trim()
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
