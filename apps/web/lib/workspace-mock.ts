export type MockChat = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
};

export type MockUser = {
  name: string;
  email: string;
  plan: "Gratuito" | "Apoio";
  tokensUsed: number;
  tokensLimit: number;
};

export const MOCK_USER: MockUser = {
  name: "Maria Silva",
  email: "maria@escola.gov.br",
  plan: "Gratuito",
  tokensUsed: 8,
  tokensLimit: 20,
};

export const MOCK_CHATS: MockChat[] = [
  {
    id: "1",
    title: "Erro Q12 — Matemática",
    preview: "Por que a alternativa C está errada?",
    updatedAt: "há 2h",
  },
  {
    id: "2",
    title: "Função do 2º grau",
    preview: "Me explica o vértice da parábola",
    updatedAt: "ontem",
  },
  {
    id: "3",
    title: "Interpretação de texto",
    preview: "Como identificar ironia no ENEM?",
    updatedAt: "há 3 dias",
  },
];

export const MOCK_PROFICIENCY = [
  { area: "Matemática", value: 62 },
  { area: "Linguagens", value: 78 },
  { area: "Humanas", value: 55 },
  { area: "Natureza", value: 48 },
  { area: "Redação", value: 70 },
];

export const MOCK_TRILHA = [
  { topic: "Funções e gráficos", area: "Matemática", priority: "Alta" },
  { topic: "Eletromagnetismo", area: "Natureza", priority: "Alta" },
  { topic: "Brasil República", area: "Humanas", priority: "Média" },
];
