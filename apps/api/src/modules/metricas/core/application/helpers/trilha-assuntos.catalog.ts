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
  { id: 'hum-historia', nome: 'História', areaSlug: 'humanas', palavrasChave: ['brasil', 'república'] },
  { id: 'hum-geografia', nome: 'Geografia', areaSlug: 'humanas', palavrasChave: ['clima', 'urbanização'] },
  { id: 'hum-sociologia', nome: 'Sociologia', areaSlug: 'humanas', palavrasChave: ['sociedade', 'cultura'] },
  { id: 'hum-filosofia', nome: 'Filosofia', areaSlug: 'humanas', palavrasChave: ['ética', 'política'] },
  { id: 'hum-atualidades', nome: 'Atualidades', areaSlug: 'humanas', palavrasChave: ['notícias', 'mundo'] },
  { id: 'hum-antropologia', nome: 'Antropologia', areaSlug: 'humanas', palavrasChave: ['cultura', 'identidade'] },
  { id: 'nat-fisica', nome: 'Física', areaSlug: 'natureza', palavrasChave: ['mecânica', 'energia'] },
  { id: 'nat-quimica', nome: 'Química', areaSlug: 'natureza', palavrasChave: ['reação', 'mol'] },
  { id: 'nat-biologia', nome: 'Biologia', areaSlug: 'natureza', palavrasChave: ['célula', 'evolução'] },
  { id: 'nat-ecologia', nome: 'Ecologia', areaSlug: 'natureza', palavrasChave: ['meio ambiente', 'bioma'] },
  { id: 'nat-energia', nome: 'Energia e meio ambiente', areaSlug: 'natureza', palavrasChave: ['sustentabilidade'] },
  { id: 'nat-genetica', nome: 'Genética', areaSlug: 'natureza', palavrasChave: ['dna', 'hereditariedade'] },
  { id: 'nat-corpo', nome: 'Corpo humano', areaSlug: 'natureza', palavrasChave: ['anatomia', 'saúde'] },
];

export function getAssuntoById(id: string): TrilhaAssuntoCatalogo | undefined {
  return TRILHA_ASSUNTOS.find((item) => item.id === id);
}

export function getAssuntosPorArea(areaSlug: string): TrilhaAssuntoCatalogo[] {
  return TRILHA_ASSUNTOS.filter((item) => item.areaSlug === areaSlug);
}
