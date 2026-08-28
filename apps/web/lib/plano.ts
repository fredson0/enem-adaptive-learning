import { apiFetch } from "@/lib/api";

export type PlanoTipo = "GRATUITO" | "APOIO";

export type PlanoAssinatura = {
  tipo: PlanoTipo;
  label: string;
  tokensDiarios: number;
  ativo: boolean;
};

export function fetchPlano() {
  return apiFetch<PlanoAssinatura>("/usuarios/plano", {
    auth: true,
    redirectOnUnauthenticated: false,
  });
}

export const PLANOS_CATALOGO = [
  {
    tipo: "GRATUITO" as const,
    name: "Gratuito",
    price: "R$ 0",
    description:
      "Para alunos de escola pública. Tokens IA diários limitados, simulados e métricas completas.",
    features: [
      "10 tokens IA/dia",
      "Simulados ilimitados",
      "Trilha e progresso",
      "Inclusão digital",
    ],
    highlighted: false,
  },
  {
    tipo: "APOIO" as const,
    name: "Apoio",
    price: "R$ 20/mês",
    description:
      "Mais tokens de IA e apoio à inclusão digital do projeto para escolas públicas.",
    features: [
      "200 tokens IA/dia",
      "Prioridade no tutor",
      "Subsidia alunos gratuitos",
      "Suporte ao projeto TCC",
    ],
    highlighted: true,
  },
];
