import type { AreaEnemSlug } from "@/lib/simulados";

export type AreaDiagnosticoConfig = {
  slug: AreaEnemSlug;
  label: string;
  cor: string;
  disciplinas: string[];
};

/** Principais assuntos cobrados no ENEM — curadoria, não lista exaustiva. */
export const AREAS_DIAGNOSTICO: AreaDiagnosticoConfig[] = [
  {
    slug: "matematica",
    label: "Matemática",
    cor: "#60a5fa",
    disciplinas: [
      "Funções",
      "Geometria",
      "Probabilidade",
      "Porcentagem",
      "Estatística",
      "Razão e proporção",
    ],
  },
  {
    slug: "linguagens",
    label: "Linguagens",
    cor: "#f472b6",
    disciplinas: [
      "Língua Portuguesa",
      "Interpretação de texto",
      "Literatura",
      "Gramática",
      "Redação",
      "Gêneros textuais",
      "Figuras de linguagem",
      "Inglês",
      "Espanhol",
    ],
  },
  {
    slug: "humanas",
    label: "Ciências Humanas",
    cor: "#fbbf24",
    disciplinas: [
      "História",
      "Geografia",
      "Sociologia",
      "Filosofia",
      "Atualidades",
    ],
  },
  {
    slug: "natureza",
    label: "Ciências da Natureza",
    cor: "#34d399",
    disciplinas: [
      "Física",
      "Química",
      "Biologia",
      "Ecologia",
      "Energia e meio ambiente",
    ],
  },
];

export const NIVEIS_CONFIANCA = [
  { valor: 1, label: "Muito fraco", descricao: "Preciso começar do básico" },
  { valor: 2, label: "Fraco", descricao: "Tenho muitas lacunas" },
  { valor: 3, label: "Médio", descricao: "Sei algumas coisas, mas falta prática" },
  { valor: 4, label: "Bom", descricao: "Acerto a maioria com revisão" },
  { valor: 5, label: "Forte", descricao: "É uma das minhas melhores áreas" },
] as const;

export const METAS_ENEM = [
  "Medicina",
  "Engenharia",
  "Direito",
  "Administração",
  "Tecnologia",
  "Outro curso",
] as const;
