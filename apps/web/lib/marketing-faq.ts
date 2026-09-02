export type MarketingFaqItem = {
  question: string;
  answer: string;
};

export type MarketingFaqCategory = {
  id: string;
  label: string;
  items: MarketingFaqItem[];
};

export const MARKETING_FAQ_CATEGORIES: MarketingFaqCategory[] = [
  {
    id: "geral",
    label: "Geral",
    items: [
      {
        question: "O que é o ENEM+IA?",
        answer:
          "É uma plataforma educacional adaptativa para o ENEM: simulados com questões reais, métricas de proficiência, trilha personalizada e tutor com IA. O foco é inclusão digital — especialmente para estudantes de escolas públicas.",
      },
      {
        question: "Preciso pagar para começar?",
        answer:
          "Não. O plano gratuito dá acesso ao núcleo da plataforma: diagnóstico, trilha, simulados ilimitados e uma cota diária de tokens para o tutor IA. Não pedimos cartão de crédito para criar conta.",
      },
      {
        question: "Como faço login?",
        answer:
          "Entre com sua conta Google em poucos cliques. Na primeira vez, você passa por um onboarding rápido e pelo diagnóstico inicial para montar sua trilha.",
      },
      {
        question: "Funciona no celular?",
        answer:
          "Sim. A plataforma foi pensada para funcionar no navegador do celular e do computador. Para simulados longos, recomendamos tela maior — mas dá para estudar de qualquer lugar.",
      },
    ],
  },
  {
    id: "estudo",
    label: "Estudo",
    items: [
      {
        question: "Como funciona o diagnóstico?",
        answer:
          "Você responde uma autoavaliação sobre suas áreas fracas, meta de curso e tempo disponível. Com isso — e, depois, seus resultados em simulados — a plataforma prioriza as quatro áreas do ENEM e sugere por onde começar.",
      },
      {
        question: "As questões são do ENEM de verdade?",
        answer:
          "Sim. O banco reúne milhares de questões oficiais do ENEM (via api.enem.dev), com filtros por área, ano, disciplina e dificuldade. Você pode montar simulados manualmente ou pedir à IA em linguagem natural.",
      },
      {
        question: "O que são as métricas de proficiência?",
        answer:
          "São indicadores por área ENEM que evoluem conforme você responde simulados. Elas mostram lacunas, progresso e onde concentrar revisão — sem precisar adivinhar o que estudar.",
      },
      {
        question: "O que é a trilha personalizada?",
        answer:
          "É um plano sequencial por área, com etapas e orientações. Dentro de cada área você pode conversar com a IA para montar uma checklist de estudo adaptada ao seu tempo e prioridades.",
      },
    ],
  },
  {
    id: "ia-planos",
    label: "IA & Planos",
    items: [
      {
        question: "O que é o tutor IA?",
        answer:
          "Um assistente de estudos integrado à plataforma. Ele usa suas métricas e histórico para personalizar explicações, tirar dúvidas, sugerir revisões e — após simulados — explicar por que você errou.",
      },
      {
        question: "Posso enviar foto de uma questão?",
        answer:
          "Sim. Você pode enviar foto do caderno ou da prova. A IA analisa a imagem e explica passo a passo. No plano gratuito há limite diário de uso; o plano Apoio amplia a cota.",
      },
      {
        question: "O que são tokens de IA?",
        answer:
          "Tokens medem o uso do tutor (texto e imagem). O plano gratuito inclui uma cota diária para manter o projeto sustentável. Quem assina o plano Apoio recebe mais tokens por dia.",
      },
      {
        question: "Para quem é o plano gratuito?",
        answer:
          "Foi pensado para estudantes de escolas públicas e para quem precisa de preparação de qualidade sem barreira financeira. O plano Apoio (R$ 20/mês) ajuda a manter servidores e IA para toda a comunidade.",
      },
    ],
  },
];
