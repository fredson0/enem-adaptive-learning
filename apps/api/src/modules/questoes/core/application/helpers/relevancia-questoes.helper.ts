import type { AreaEnem } from '@generated/prisma';
import type { Questao } from '../../domain/entities/questao.entity';
import { expandirTermosBusca } from './termos-busca.helper';

const INDICADORES_FORTES: Record<AreaEnem, string[]> = {
  MATEMATICA: [
    'equação',
    'equações',
    'função afim',
    'função quadrática',
    'função exponencial',
    'função logarítmica',
    'gráfico da função',
    'domínio da função',
    'logaritmo',
    'porcentagem',
    'probabilidade',
    'estatística',
    'triângulo',
    'hipotenusa',
    'seno',
    'cosseno',
    'tangente',
    'polinômio',
    'parábola',
    'progressão aritmética',
    'progressão geométrica',
    'determinante',
    'matriz',
    'fração',
    'expressão algébrica',
    'calcule',
    'determine o valor',
    'qual o valor',
    'km/h',
    'razão entre',
    'média aritmética',
    'desvio padrão',
    'combinatória',
    'permutação',
    'regra de três',
    'juros compostos',
    'juros simples',
  ],
  LINGUAGENS: [
    'interpretação',
    'texto',
    'autor',
    'linguagem',
    'gramática',
    'literatura',
    'poema',
    'crônica',
    'metáfora',
    'sintaxe',
  ],
  HUMANAS: [
    'história',
    'sociedade',
    'economia',
    'política',
    'cultura',
    'geografia',
    'filosofia',
    'revolução',
    'globalização',
  ],
  NATUREZA: [
    'energia',
    'célula',
    'átomo',
    'reação química',
    'física',
    'química',
    'biologia',
    'dna',
    'ecossistema',
    'força',
    'velocidade',
    'temperatura',
  ],
};

const INDICADORES_FRACOS: Record<AreaEnem, string[]> = {
  MATEMATICA: ['número', 'calcular', 'dados', 'gráficos', 'medida', 'litros'],
  LINGUAGENS: ['leitura', 'compreensão', 'palavra'],
  HUMANAS: ['brasil', 'mundo', 'social'],
  NATUREZA: ['meio ambiente', 'organismo', 'substância'],
};

const OFF_TOPIC_POR_AREA: Record<AreaEnem, RegExp[]> = {
  MATEMATICA: [
    /\b(literatura|romantismo|modernismo|barroco|arcadismo|parnasianismo)\b/i,
    /\b(conto|crônica|poema|narrativa|romance)\b/i,
    /\b(escrava|escravidão|abolicion|senzala)\b/i,
    /\b(escritor|poesia|verso|estrofe)\b/i,
    /\b(abolição|romantismo brasileiro)\b/i,
    /\b(artístico|artistico|cultural|tradição popular|folclore)\b/i,
    /\b(vacinação|leishmaniose|saúde pública|epidemia)\b/i,
    /\b(sertão|cordel|manifestação cultural)\b/i,
    /\b(dublagem|inteligência artificial generativa)\b/i,
    /\b(esportes|atividade física|práticas corporais)\b/i,
  ],
  LINGUAGENS: [
    /\b(equação|integral|derivada|logaritmo|hipotenusa)\b/i,
    /\b(estequiometria|mitose|meiose)\b/i,
  ],
  HUMANAS: [
    /\b(equação|integral|logaritmo|hipotenusa)\b/i,
    /\b(dna|mitose|tabela periódica)\b/i,
  ],
  NATUREZA: [
    /\b(romantismo|modernismo|crônica literária)\b/i,
    /\b(equação do segundo grau|função afim)\b/i,
  ],
};

function textoQuestao(questao: Questao): string {
  return `${questao.contexto} ${questao.introducaoAlternativas ?? ''}`.toLowerCase();
}

export function isQuestaoOffTopic(questao: Questao, area?: AreaEnem): boolean {
  if (!area) return false;

  const texto = textoQuestao(questao);
  return OFF_TOPIC_POR_AREA[area].some((padrao) => padrao.test(texto));
}

function temIndicadorForte(questao: Questao, area: AreaEnem): boolean {
  const texto = textoQuestao(questao);
  return INDICADORES_FORTES[area].some((termo) =>
    texto.includes(termo.toLowerCase()),
  );
}

function temIndicadorFraco(questao: Questao, area: AreaEnem): boolean {
  const texto = textoQuestao(questao);
  return INDICADORES_FRACOS[area].some((termo) =>
    texto.includes(termo.toLowerCase()),
  );
}

export function pontuarRelevanciaQuestao(
  questao: Questao,
  termos: string[],
  area?: AreaEnem,
): number {
  const texto = textoQuestao(questao);
  const termosNormalizados = expandirTermosBusca(termos);
  let score = 0;

  for (const termo of termosNormalizados) {
    if (texto.includes(termo.toLowerCase())) {
      score += 2;
    }
  }

  if (area) {
    if (temIndicadorForte(questao, area)) score += 4;
    else if (temIndicadorFraco(questao, area)) score += 1;
  }

  if (isQuestaoOffTopic(questao, area)) {
    score -= 12;
  }

  return score;
}

export function getIndicadoresArea(area: AreaEnem): string[] {
  return [...INDICADORES_FORTES[area], ...INDICADORES_FRACOS[area]];
}

function filtrarCandidatasPorArea(
  candidatas: Questao[],
  area?: AreaEnem,
  rigoroso = true,
): Questao[] {
  let filtradas = candidatas.filter((questao) => !isQuestaoOffTopic(questao, area));

  if (!area) return filtradas;

  const comIndicadorForte = filtradas.filter((questao) =>
    temIndicadorForte(questao, area),
  );

  if (comIndicadorForte.length > 0 || !rigoroso) {
    return comIndicadorForte.length > 0 ? comIndicadorForte : filtradas;
  }

  return filtradas.filter(
    (questao) => temIndicadorForte(questao, area) || temIndicadorFraco(questao, area),
  );
}

export function selecionarQuestoesRelevantes(input: {
  candidatas: Questao[];
  quantidade: number;
  termos: string[];
  area?: AreaEnem;
  pontuacaoMinima?: number;
}): Questao[] {
  const pontuacaoMinima = input.pontuacaoMinima ?? 2;
  const filtradas = filtrarCandidatasPorArea(
    input.candidatas,
    input.area,
    true,
  );

  const rankeadas = filtradas
    .map((questao) => ({
      questao,
      score: pontuarRelevanciaQuestao(questao, input.termos, input.area),
    }))
    .filter((item) => item.score >= pontuacaoMinima)
    .sort((a, b) => b.score - a.score);

  if (rankeadas.length >= input.quantidade) {
    const pool = rankeadas.slice(0, Math.max(input.quantidade * 4, 20));
    return embaralhar(pool.map((item) => item.questao)).slice(0, input.quantidade);
  }

  const relaxadas = filtrarCandidatasPorArea(input.candidatas, input.area, false)
    .map((questao) => ({
      questao,
      score: pontuarRelevanciaQuestao(questao, input.termos, input.area),
    }))
    .filter((item) => item.score >= 1)
    .sort((a, b) => b.score - a.score);

  if (relaxadas.length > 0) {
    const pool = relaxadas.slice(0, Math.max(input.quantidade * 4, 20));
    return embaralhar(pool.map((item) => item.questao)).slice(0, input.quantidade);
  }

  return embaralhar(filtrarCandidatasPorArea(input.candidatas, input.area, false)).slice(
    0,
    input.quantidade,
  );
}

function embaralhar<T>(items: T[]): T[] {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
