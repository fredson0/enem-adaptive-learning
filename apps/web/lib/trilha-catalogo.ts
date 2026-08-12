import type { AreaEnemSlug } from "@/lib/simulados";

export type TrilhaAssuntoItem = {
  id: string;
  nome: string;
  gradient: string;
  palavrasChave: string[];
};

export type TrilhaModalidadeItem = {
  id: string;
  nome: string;
  areaSlug: AreaEnemSlug;
  areaLabel: string;
  areaCor: string;
  areaTag: string;
  gradient: string;
  palavrasChave: string[];
  assuntos: TrilhaAssuntoItem[];
};

/** Assunto enriquecido com contexto da modalidade (para cards e links). */
export type TrilhaAssuntoCatalogo = TrilhaAssuntoItem & {
  modalidadeId: string;
  modalidadeNome: string;
  areaSlug: AreaEnemSlug;
  areaLabel: string;
  areaCor: string;
  areaTag: string;
};

const CATALOGO_MODALIDADES: TrilhaModalidadeItem[] = [
  {
    id: "matematica",
    nome: "Matemática",
    areaSlug: "matematica",
    areaLabel: "Matemática",
    areaCor: "#60a5fa",
    areaTag: "Exatas",
    gradient: "from-[#1e3a8a] via-[#1a1a2e] to-[#141414]",
    palavrasChave: ["exatas", "números", "cálculo"],
    assuntos: [
      {
        id: "mat-funcoes",
        nome: "Funções",
        gradient: "from-[#1e3a8a] via-[#1a1a2e] to-[#141414]",
        palavrasChave: ["álgebra", "gráfico"],
      },
      {
        id: "mat-geometria-plana",
        nome: "Geometria plana",
        gradient: "from-[#1d4ed8] via-[#172554] to-[#141414]",
        palavrasChave: ["área", "triângulo"],
      },
      {
        id: "mat-geometria-espacial",
        nome: "Geometria espacial",
        gradient: "from-[#2563eb] via-[#1e293b] to-[#141414]",
        palavrasChave: ["volume", "prisma"],
      },
      {
        id: "mat-trigonometria",
        nome: "Trigonometria",
        gradient: "from-[#3b82f6] via-[#1e3a5f] to-[#141414]",
        palavrasChave: ["seno", "cosseno"],
      },
      {
        id: "mat-probabilidade",
        nome: "Probabilidade",
        gradient: "from-[#1e40af] via-[#0f172a] to-[#141414]",
        palavrasChave: ["chance", "evento"],
      },
      {
        id: "mat-estatistica",
        nome: "Estatística",
        gradient: "from-[#1d4ed8] via-[#111827] to-[#141414]",
        palavrasChave: ["média", "mediana"],
      },
      {
        id: "mat-porcentagem",
        nome: "Porcentagem",
        gradient: "from-[#2563eb] via-[#1a1a2e] to-[#141414]",
        palavrasChave: ["desconto", "juros"],
      },
      {
        id: "mat-razao",
        nome: "Razão e proporção",
        gradient: "from-[#1e3a8a] via-[#0f172a] to-[#141414]",
        palavrasChave: ["regra de três"],
      },
      {
        id: "mat-financeira",
        nome: "Matemática financeira",
        gradient: "from-[#1d4ed8] via-[#1a1a2e] to-[#141414]",
        palavrasChave: ["juros compostos"],
      },
      {
        id: "mat-combinatoria",
        nome: "Análise combinatória",
        gradient: "from-[#3b82f6] via-[#172554] to-[#141414]",
        palavrasChave: ["permutação", "combinação"],
      },
      {
        id: "mat-progressoes",
        nome: "Progressões",
        gradient: "from-[#2563eb] via-[#111827] to-[#141414]",
        palavrasChave: ["pa", "pg"],
      },
    ],
  },
  {
    id: "portugues",
    nome: "Língua Portuguesa",
    areaSlug: "linguagens",
    areaLabel: "Linguagens",
    areaCor: "#f472b6",
    areaTag: "Texto",
    gradient: "from-[#9d174d] via-[#1a1020] to-[#141414]",
    palavrasChave: ["português", "língua portuguesa", "lp"],
    assuntos: [
      {
        id: "pt-interpretacao",
        nome: "Interpretação de texto",
        gradient: "from-[#831843] via-[#1a1020] to-[#141414]",
        palavrasChave: ["leitura", "compreensão"],
      },
      {
        id: "pt-literatura",
        nome: "Literatura",
        gradient: "from-[#be185d] via-[#1a1020] to-[#141414]",
        palavrasChave: ["romantismo", "modernismo"],
      },
      {
        id: "pt-gramatica",
        nome: "Gramática",
        gradient: "from-[#9f1239] via-[#1a1020] to-[#141414]",
        palavrasChave: ["sintaxe", "concordância"],
      },
      {
        id: "pt-redacao",
        nome: "Redação",
        gradient: "from-[#db2777] via-[#1a1020] to-[#141414]",
        palavrasChave: ["dissertação", "c1"],
      },
      {
        id: "pt-generos",
        nome: "Gêneros textuais",
        gradient: "from-[#831843] via-[#111] to-[#141414]",
        palavrasChave: ["notícia", "crônica"],
      },
      {
        id: "pt-figuras",
        nome: "Figuras de linguagem",
        gradient: "from-[#be185d] via-[#111] to-[#141414]",
        palavrasChave: ["metáfora", "ironia"],
      },
      {
        id: "pt-artes",
        nome: "Artes",
        gradient: "from-[#a21caf] via-[#1a1020] to-[#141414]",
        palavrasChave: ["arte", "cultura"],
      },
    ],
  },
  {
    id: "ingles",
    nome: "Inglês",
    areaSlug: "linguagens",
    areaLabel: "Linguagens",
    areaCor: "#f472b6",
    areaTag: "Texto",
    gradient: "from-[#ec4899] via-[#1a1020] to-[#141414]",
    palavrasChave: ["english", "inglês", "foreign language"],
    assuntos: [
      {
        id: "en-reading",
        nome: "Reading comprehension",
        gradient: "from-[#ec4899] via-[#1a1020] to-[#141414]",
        palavrasChave: ["texto", "interpretação"],
      },
      {
        id: "en-vocabulary",
        nome: "Vocabulário",
        gradient: "from-[#db2777] via-[#1a1020] to-[#141414]",
        palavrasChave: ["words", "palavras"],
      },
      {
        id: "en-grammar",
        nome: "Gramática contextual",
        gradient: "from-[#be185d] via-[#111] to-[#141414]",
        palavrasChave: ["verb tense", "syntax"],
      },
      {
        id: "en-cognates",
        nome: "Cognatos e falsos cognatos",
        gradient: "from-[#9d174d] via-[#111] to-[#141414]",
        palavrasChave: ["false friends"],
      },
    ],
  },
  {
    id: "espanhol",
    nome: "Espanhol",
    areaSlug: "linguagens",
    areaLabel: "Linguagens",
    areaCor: "#f472b6",
    areaTag: "Texto",
    gradient: "from-[#f43f5e] via-[#1a1020] to-[#141414]",
    palavrasChave: ["español", "espanhol", "lengua extranjera"],
    assuntos: [
      {
        id: "es-comprension",
        nome: "Comprensión de texto",
        gradient: "from-[#f43f5e] via-[#1a1020] to-[#141414]",
        palavrasChave: ["lectura", "interpretación"],
      },
      {
        id: "es-vocabulario",
        nome: "Vocabulário",
        gradient: "from-[#e11d48] via-[#1a1020] to-[#141414]",
        palavrasChave: ["palabras", "vocabulario"],
      },
      {
        id: "es-gramatica",
        nome: "Gramática contextual",
        gradient: "from-[#be123c] via-[#111] to-[#141414]",
        palavrasChave: ["verbos", "tiempos"],
      },
      {
        id: "es-cognados",
        nome: "Cognatos e falsos cognatos",
        gradient: "from-[#9f1239] via-[#111] to-[#141414]",
        palavrasChave: ["falsos amigos"],
      },
    ],
  },
  {
    id: "humanas",
    nome: "Ciências Humanas",
    areaSlug: "humanas",
    areaLabel: "Ciências Humanas",
    areaCor: "#fbbf24",
    areaTag: "Humanas",
    gradient: "from-[#78350f] via-[#1a1510] to-[#141414]",
    palavrasChave: ["ch", "história", "geografia", "sociedade"],
    assuntos: [
      {
        id: "hum-historia",
        nome: "História",
        gradient: "from-[#78350f] via-[#1a1510] to-[#141414]",
        palavrasChave: ["brasil", "república"],
      },
      {
        id: "hum-geografia",
        nome: "Geografia",
        gradient: "from-[#92400e] via-[#1a1510] to-[#141414]",
        palavrasChave: ["clima", "urbanização"],
      },
      {
        id: "hum-sociologia",
        nome: "Sociologia",
        gradient: "from-[#b45309] via-[#1a1510] to-[#141414]",
        palavrasChave: ["sociedade", "cultura"],
      },
      {
        id: "hum-filosofia",
        nome: "Filosofia",
        gradient: "from-[#a16207] via-[#1a1510] to-[#141414]",
        palavrasChave: ["ética", "política"],
      },
      {
        id: "hum-atualidades",
        nome: "Atualidades",
        gradient: "from-[#ca8a04] via-[#1a1510] to-[#141414]",
        palavrasChave: ["notícias", "mundo"],
      },
      {
        id: "hum-antropologia",
        nome: "Antropologia",
        gradient: "from-[#854d0e] via-[#1a1510] to-[#141414]",
        palavrasChave: ["identidade", "diversidade"],
      },
    ],
  },
  {
    id: "natureza",
    nome: "Ciências da Natureza",
    areaSlug: "natureza",
    areaLabel: "Ciências da Natureza",
    areaCor: "#34d399",
    areaTag: "Natureza",
    gradient: "from-[#064e3b] via-[#0f1a18] to-[#141414]",
    palavrasChave: ["cn", "física", "química", "biologia"],
    assuntos: [
      {
        id: "nat-fisica",
        nome: "Física",
        gradient: "from-[#064e3b] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["mecânica", "energia"],
      },
      {
        id: "nat-quimica",
        nome: "Química",
        gradient: "from-[#047857] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["reação", "mol"],
      },
      {
        id: "nat-biologia",
        nome: "Biologia",
        gradient: "from-[#059669] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["célula", "evolução"],
      },
      {
        id: "nat-ecologia",
        nome: "Ecologia",
        gradient: "from-[#065f46] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["bioma", "sustentabilidade"],
      },
      {
        id: "nat-energia",
        nome: "Energia e meio ambiente",
        gradient: "from-[#10b981] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["poluição", "clima"],
      },
      {
        id: "nat-genetica",
        nome: "Genética",
        gradient: "from-[#059669] via-[#111] to-[#141414]",
        palavrasChave: ["dna", "hereditariedade"],
      },
      {
        id: "nat-corpo",
        nome: "Corpo humano",
        gradient: "from-[#047857] via-[#111] to-[#141414]",
        palavrasChave: ["anatomia", "saúde"],
      },
    ],
  },
];

export const TRILHA_MODALIDADES = CATALOGO_MODALIDADES;

export const TRILHA_ASSUNTOS: TrilhaAssuntoCatalogo[] =
  CATALOGO_MODALIDADES.flatMap((modalidade) =>
    modalidade.assuntos.map((assunto) => ({
      ...assunto,
      modalidadeId: modalidade.id,
      modalidadeNome: modalidade.nome,
      areaSlug: modalidade.areaSlug,
      areaLabel: modalidade.areaLabel,
      areaCor: modalidade.areaCor,
      areaTag: modalidade.areaTag,
    })),
  );

export function getModalidadeById(id: string): TrilhaModalidadeItem | undefined {
  return CATALOGO_MODALIDADES.find((item) => item.id === id);
}

export function filtrarModalidades(termo: string): TrilhaModalidadeItem[] {
  const busca = termo.trim().toLowerCase();
  if (!busca) return CATALOGO_MODALIDADES;

  return CATALOGO_MODALIDADES.filter((modalidade) => {
    const textoModalidade = [
      modalidade.nome,
      modalidade.areaLabel,
      modalidade.areaTag,
      ...modalidade.palavrasChave,
    ]
      .join(" ")
      .toLowerCase();

    if (textoModalidade.includes(busca)) return true;

    return modalidade.assuntos.some((assunto) =>
      [assunto.nome, ...assunto.palavrasChave].join(" ").toLowerCase().includes(busca),
    );
  });
}

export function filtrarAssuntosModalidade(
  modalidadeId: string,
  termo: string,
): TrilhaAssuntoCatalogo[] {
  const modalidade = getModalidadeById(modalidadeId);
  if (!modalidade) return [];

  const busca = termo.trim().toLowerCase();
  const assuntos = TRILHA_ASSUNTOS.filter(
    (item) => item.modalidadeId === modalidadeId,
  );

  if (!busca) return assuntos;

  return assuntos.filter((assunto) =>
    [assunto.nome, ...assunto.palavrasChave]
      .join(" ")
      .toLowerCase()
      .includes(busca),
  );
}

/** Agrupa modalidades por área ENEM para exibição na raiz. */
export function agruparModalidadesPorArea(
  modalidades: TrilhaModalidadeItem[],
): { areaSlug: AreaEnemSlug; label: string; cor: string; tag: string; itens: TrilhaModalidadeItem[] }[] {
  const ordem: AreaEnemSlug[] = [
    "matematica",
    "linguagens",
    "humanas",
    "natureza",
  ];

  const labels: Record<AreaEnemSlug, string> = {
    matematica: "Matemática e suas Tecnologias",
    linguagens: "Linguagens e Códigos",
    humanas: "Ciências Humanas",
    natureza: "Ciências da Natureza",
  };

  return ordem
    .map((areaSlug) => {
      const itens = modalidades.filter((m) => m.areaSlug === areaSlug);
      const ref = itens[0];
      if (!ref) return null;
      return {
        areaSlug,
        label: labels[areaSlug],
        cor: ref.areaCor,
        tag: ref.areaTag,
        itens,
      };
    })
    .filter((grupo): grupo is NonNullable<typeof grupo> => grupo !== null);
}

/** @deprecated Use TrilhaAssuntoCatalogo */
export type TrilhaDisciplinaItem = TrilhaAssuntoCatalogo;

/** @deprecated Use TRILHA_ASSUNTOS */
export const TRILHA_CATALOGO = TRILHA_ASSUNTOS;
