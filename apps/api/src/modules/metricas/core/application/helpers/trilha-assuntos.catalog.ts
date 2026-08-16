export type TrilhaAssuntoCatalogo = {
  id: string;
  nome: string;
  areaSlug: string;
  palavrasChave: string[];
};

/** Catálogo mínimo de assuntos — espelha apps/web/lib/trilha-catalogo.ts */
export const TRILHA_ASSUNTOS: TrilhaAssuntoCatalogo[] = [
  { id: 'mat-funcoes', nome: 'Funções', areaSlug: 'matematica', palavrasChave: ['álgebra', 'gráfico'] },
  { id: 'mat-geometria-plana', nome: 'Geometria plana', areaSlug: 'matematica', palavrasChave: ['área', 'triângulo'] },
  { id: 'mat-geometria-espacial', nome: 'Geometria espacial', areaSlug: 'matematica', palavrasChave: ['volume', 'prisma'] },
  { id: 'mat-trigonometria', nome: 'Trigonometria', areaSlug: 'matematica', palavrasChave: ['seno', 'cosseno'] },
  { id: 'mat-probabilidade', nome: 'Probabilidade', areaSlug: 'matematica', palavrasChave: ['chance', 'evento'] },
  { id: 'mat-estatistica', nome: 'Estatística', areaSlug: 'matematica', palavrasChave: ['média', 'mediana'] },
  { id: 'mat-porcentagem', nome: 'Porcentagem', areaSlug: 'matematica', palavrasChave: ['desconto', 'juros'] },
  { id: 'mat-razao', nome: 'Razão e proporção', areaSlug: 'matematica', palavrasChave: ['regra de três'] },
  { id: 'mat-financeira', nome: 'Matemática financeira', areaSlug: 'matematica', palavrasChave: ['juros compostos'] },
  { id: 'mat-combinatoria', nome: 'Análise combinatória', areaSlug: 'matematica', palavrasChave: ['permutação', 'combinação'] },
  { id: 'mat-progressoes', nome: 'Progressões', areaSlug: 'matematica', palavrasChave: ['pa', 'pg'] },
  { id: 'pt-interpretacao', nome: 'Interpretação de texto', areaSlug: 'linguagens', palavrasChave: ['leitura', 'compreensão'] },
  { id: 'pt-literatura', nome: 'Literatura', areaSlug: 'linguagens', palavrasChave: ['romantismo', 'modernismo'] },
  { id: 'pt-gramatica', nome: 'Gramática', areaSlug: 'linguagens', palavrasChave: ['sintaxe', 'concordância'] },
  { id: 'pt-redacao', nome: 'Redação', areaSlug: 'linguagens', palavrasChave: ['dissertação', 'c1'] },
  { id: 'pt-generos', nome: 'Gêneros textuais', areaSlug: 'linguagens', palavrasChave: ['notícia', 'crônica'] },
  { id: 'pt-figuras', nome: 'Figuras de linguagem', areaSlug: 'linguagens', palavrasChave: ['metáfora', 'ironia'] },
  { id: 'pt-artes', nome: 'Artes', areaSlug: 'linguagens', palavrasChave: ['arte', 'cultura'] },
  { id: 'en-reading', nome: 'Reading comprehension', areaSlug: 'linguagens', palavrasChave: ['texto', 'interpretação'] },
  { id: 'en-vocabulary', nome: 'Vocabulário', areaSlug: 'linguagens', palavrasChave: ['words', 'palavras'] },
  { id: 'en-grammar', nome: 'Gramática contextual', areaSlug: 'linguagens', palavrasChave: ['verb tense', 'syntax'] },
  { id: 'en-cognates', nome: 'Cognatos e falsos cognatos', areaSlug: 'linguagens', palavrasChave: ['false friends'] },
  { id: 'es-comprension', nome: 'Comprensión de texto', areaSlug: 'linguagens', palavrasChave: ['lectura', 'interpretación'] },
  { id: 'es-vocabulario', nome: 'Vocabulário', areaSlug: 'linguagens', palavrasChave: ['palabras', 'vocabulario'] },
  { id: 'es-gramatica', nome: 'Gramática contextual', areaSlug: 'linguagens', palavrasChave: ['verbos', 'tiempos'] },
  { id: 'es-cognados', nome: 'Cognatos e falsos cognatos', areaSlug: 'linguagens', palavrasChave: ['falsos amigos'] },
  { id: 'hum-hist-brasil-colonia', nome: 'Brasil Colônia e Império', areaSlug: 'humanas', palavrasChave: ['colônia', 'império'] },
  { id: 'hum-hist-brasil-republica', nome: 'Brasil República', areaSlug: 'humanas', palavrasChave: ['república', 'vargas'] },
  { id: 'hum-hist-mundo', nome: 'História mundial', areaSlug: 'humanas', palavrasChave: ['revolução', 'industrial'] },
  { id: 'hum-hist-guerra-fria', nome: 'Guerra Fria', areaSlug: 'humanas', palavrasChave: ['guerra fria', 'blocos'] },
  { id: 'hum-geo-fisica', nome: 'Geografia física', areaSlug: 'humanas', palavrasChave: ['clima', 'relevo'] },
  { id: 'hum-geo-humana', nome: 'Geografia humana', areaSlug: 'humanas', palavrasChave: ['população', 'migração'] },
  { id: 'hum-geo-urbanizacao', nome: 'Urbanização', areaSlug: 'humanas', palavrasChave: ['cidade', 'metrópole'] },
  { id: 'hum-geo-geopolitica', nome: 'Geopolítica', areaSlug: 'humanas', palavrasChave: ['conflitos', 'globalização'] },
  { id: 'hum-soc-cultura', nome: 'Cultura e sociedade', areaSlug: 'humanas', palavrasChave: ['cultura', 'identidade'] },
  { id: 'hum-soc-movimentos', nome: 'Movimentos sociais', areaSlug: 'humanas', palavrasChave: ['protesto', 'direitos'] },
  { id: 'hum-filo-etica', nome: 'Ética', areaSlug: 'humanas', palavrasChave: ['moral', 'virtude'] },
  { id: 'hum-filo-politica', nome: 'Filosofia política', areaSlug: 'humanas', palavrasChave: ['estado', 'democracia'] },
  { id: 'hum-atual-mundo', nome: 'Mundo contemporâneo', areaSlug: 'humanas', palavrasChave: ['atualidades', 'notícias'] },
  { id: 'hum-antro-cultura', nome: 'Cultura e identidade', areaSlug: 'humanas', palavrasChave: ['etnia', 'diversidade'] },
  { id: 'nat-fis-mecanica', nome: 'Mecânica', areaSlug: 'natureza', palavrasChave: ['força', 'movimento'] },
  { id: 'nat-fis-termodinamica', nome: 'Termodinâmica', areaSlug: 'natureza', palavrasChave: ['calor', 'temperatura'] },
  { id: 'nat-fis-ondas', nome: 'Ondas e óptica', areaSlug: 'natureza', palavrasChave: ['luz', 'som'] },
  { id: 'nat-energia', nome: 'Energia e meio ambiente', areaSlug: 'natureza', palavrasChave: ['poluição', 'clima'] },
  { id: 'nat-quim-geral', nome: 'Química geral', areaSlug: 'natureza', palavrasChave: ['átomo', 'tabela periódica'] },
  { id: 'nat-quim-reacoes', nome: 'Reações químicas', areaSlug: 'natureza', palavrasChave: ['estequiometria', 'balanceamento'] },
  { id: 'nat-quim-organica', nome: 'Química orgânica', areaSlug: 'natureza', palavrasChave: ['carbono', 'hidrocarboneto'] },
  { id: 'nat-bio-celula', nome: 'Citologia', areaSlug: 'natureza', palavrasChave: ['célula', 'membrana'] },
  { id: 'nat-ecologia', nome: 'Ecologia', areaSlug: 'natureza', palavrasChave: ['bioma', 'sustentabilidade'] },
  { id: 'nat-genetica', nome: 'Genética', areaSlug: 'natureza', palavrasChave: ['dna', 'hereditariedade'] },
  { id: 'nat-corpo', nome: 'Corpo humano', areaSlug: 'natureza', palavrasChave: ['anatomia', 'saúde'] },
  { id: 'nat-bio-evolucao', nome: 'Evolução', areaSlug: 'natureza', palavrasChave: ['darwin', 'seleção natural'] },
];

export function getAssuntoById(id: string): TrilhaAssuntoCatalogo | undefined {
  return TRILHA_ASSUNTOS.find((item) => item.id === id);
}

export function getAssuntosPorArea(areaSlug: string): TrilhaAssuntoCatalogo[] {
  return TRILHA_ASSUNTOS.filter((item) => item.areaSlug === areaSlug);
}
