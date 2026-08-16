import type { AreaEnemSlug } from "@/lib/simulados";

export type TrilhaAssuntoItem = {
  id: string;
  nome: string;
  gradient: string;
  palavrasChave: string[];
};

export type TrilhaDisciplinaItem = {
  id: string;
  nome: string;
  gradient: string;
  palavrasChave: string[];
  assuntos: TrilhaAssuntoItem[];
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
  /** Assuntos diretos — modalidades sem subdivisão (ex.: Matemática). */
  assuntos?: TrilhaAssuntoItem[];
  /** Matérias com assuntos aninhados (ex.: Física, Química, Biologia). */
  disciplinas?: TrilhaDisciplinaItem[];
};

/** Assunto enriquecido com contexto da modalidade (para cards e links). */
export type TrilhaAssuntoCatalogo = TrilhaAssuntoItem & {
  modalidadeId: string;
  modalidadeNome: string;
  areaSlug: AreaEnemSlug;
  areaLabel: string;
  areaCor: string;
  areaTag: string;
  disciplinaId?: string;
  disciplinaNome?: string;
};

/** Disciplina enriquecida com contexto da modalidade (para cards de matéria). */
export type TrilhaDisciplinaCatalogo = TrilhaDisciplinaItem & {
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
    disciplinas: [
      {
        id: "hum-historia",
        nome: "História",
        gradient: "from-[#78350f] via-[#1a1510] to-[#141414]",
        palavrasChave: ["brasil", "república"],
        assuntos: [
          {
            id: "hum-hist-brasil-colonia",
            nome: "Brasil Colônia e Império",
            gradient: "from-[#78350f] via-[#1a1510] to-[#141414]",
            palavrasChave: ["colônia", "império"],
          },
          {
            id: "hum-hist-brasil-republica",
            nome: "Brasil República",
            gradient: "from-[#92400e] via-[#1a1510] to-[#141414]",
            palavrasChave: ["república", "vargas"],
          },
          {
            id: "hum-hist-mundo",
            nome: "História mundial",
            gradient: "from-[#a16207] via-[#1a1510] to-[#141414]",
            palavrasChave: ["revolução", "industrial"],
          },
          {
            id: "hum-hist-guerra-fria",
            nome: "Guerra Fria",
            gradient: "from-[#b45309] via-[#1a1510] to-[#141414]",
            palavrasChave: ["guerra fria", "blocos"],
          },
        ],
      },
      {
        id: "hum-geografia",
        nome: "Geografia",
        gradient: "from-[#92400e] via-[#1a1510] to-[#141414]",
        palavrasChave: ["clima", "urbanização"],
        assuntos: [
          {
            id: "hum-geo-fisica",
            nome: "Geografia física",
            gradient: "from-[#92400e] via-[#1a1510] to-[#141414]",
            palavrasChave: ["clima", "relevo"],
          },
          {
            id: "hum-geo-humana",
            nome: "Geografia humana",
            gradient: "from-[#a16207] via-[#1a1510] to-[#141414]",
            palavrasChave: ["população", "migração"],
          },
          {
            id: "hum-geo-urbanizacao",
            nome: "Urbanização",
            gradient: "from-[#b45309] via-[#1a1510] to-[#141414]",
            palavrasChave: ["cidade", "metrópole"],
          },
          {
            id: "hum-geo-geopolitica",
            nome: "Geopolítica",
            gradient: "from-[#ca8a04] via-[#1a1510] to-[#141414]",
            palavrasChave: ["conflitos", "globalização"],
          },
        ],
      },
      {
        id: "hum-sociologia",
        nome: "Sociologia",
        gradient: "from-[#b45309] via-[#1a1510] to-[#141414]",
        palavrasChave: ["sociedade", "cultura"],
        assuntos: [
          {
            id: "hum-soc-cultura",
            nome: "Cultura e sociedade",
            gradient: "from-[#b45309] via-[#1a1510] to-[#141414]",
            palavrasChave: ["cultura", "identidade"],
          },
          {
            id: "hum-soc-movimentos",
            nome: "Movimentos sociais",
            gradient: "from-[#ca8a04] via-[#1a1510] to-[#141414]",
            palavrasChave: ["protesto", "direitos"],
          },
        ],
      },
      {
        id: "hum-filosofia",
        nome: "Filosofia",
        gradient: "from-[#a16207] via-[#1a1510] to-[#141414]",
        palavrasChave: ["ética", "política"],
        assuntos: [
          {
            id: "hum-filo-etica",
            nome: "Ética",
            gradient: "from-[#a16207] via-[#1a1510] to-[#141414]",
            palavrasChave: ["moral", "virtude"],
          },
          {
            id: "hum-filo-politica",
            nome: "Filosofia política",
            gradient: "from-[#b45309] via-[#1a1510] to-[#141414]",
            palavrasChave: ["estado", "democracia"],
          },
        ],
      },
      {
        id: "hum-atualidades",
        nome: "Atualidades",
        gradient: "from-[#ca8a04] via-[#1a1510] to-[#141414]",
        palavrasChave: ["notícias", "mundo"],
        assuntos: [
          {
            id: "hum-atual-mundo",
            nome: "Mundo contemporâneo",
            gradient: "from-[#ca8a04] via-[#1a1510] to-[#141414]",
            palavrasChave: ["atualidades", "notícias"],
          },
        ],
      },
      {
        id: "hum-antropologia",
        nome: "Antropologia",
        gradient: "from-[#854d0e] via-[#1a1510] to-[#141414]",
        palavrasChave: ["identidade", "diversidade"],
        assuntos: [
          {
            id: "hum-antro-cultura",
            nome: "Cultura e identidade",
            gradient: "from-[#854d0e] via-[#1a1510] to-[#141414]",
            palavrasChave: ["etnia", "diversidade"],
          },
        ],
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
    disciplinas: [
      {
        id: "nat-fisica",
        nome: "Física",
        gradient: "from-[#064e3b] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["mecânica", "energia"],
        assuntos: [
          {
            id: "nat-fis-mecanica",
            nome: "Mecânica",
            gradient: "from-[#064e3b] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["força", "movimento"],
          },
          {
            id: "nat-fis-termodinamica",
            nome: "Termodinâmica",
            gradient: "from-[#047857] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["calor", "temperatura"],
          },
          {
            id: "nat-fis-ondas",
            nome: "Ondas e óptica",
            gradient: "from-[#059669] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["luz", "som"],
          },
          {
            id: "nat-energia",
            nome: "Energia e meio ambiente",
            gradient: "from-[#10b981] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["poluição", "clima"],
          },
        ],
      },
      {
        id: "nat-quimica",
        nome: "Química",
        gradient: "from-[#047857] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["reação", "mol"],
        assuntos: [
          {
            id: "nat-quim-geral",
            nome: "Química geral",
            gradient: "from-[#047857] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["átomo", "tabela periódica"],
          },
          {
            id: "nat-quim-reacoes",
            nome: "Reações químicas",
            gradient: "from-[#059669] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["estequiometria", "balanceamento"],
          },
          {
            id: "nat-quim-organica",
            nome: "Química orgânica",
            gradient: "from-[#065f46] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["carbono", "hidrocarboneto"],
          },
        ],
      },
      {
        id: "nat-biologia",
        nome: "Biologia",
        gradient: "from-[#059669] via-[#0f1a18] to-[#141414]",
        palavrasChave: ["célula", "evolução"],
        assuntos: [
          {
            id: "nat-bio-celula",
            nome: "Citologia",
            gradient: "from-[#059669] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["célula", "membrana"],
          },
          {
            id: "nat-ecologia",
            nome: "Ecologia",
            gradient: "from-[#065f46] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["bioma", "sustentabilidade"],
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
          {
            id: "nat-bio-evolucao",
            nome: "Evolução",
            gradient: "from-[#10b981] via-[#0f1a18] to-[#141414]",
            palavrasChave: ["darwin", "seleção natural"],
          },
        ],
      },
    ],
  },
];

export const TRILHA_MODALIDADES = CATALOGO_MODALIDADES;

function enriquecerAssunto(
  assunto: TrilhaAssuntoItem,
  modalidade: TrilhaModalidadeItem,
  disciplina?: TrilhaDisciplinaItem,
): TrilhaAssuntoCatalogo {
  return {
    ...assunto,
    modalidadeId: modalidade.id,
    modalidadeNome: modalidade.nome,
    areaSlug: modalidade.areaSlug,
    areaLabel: modalidade.areaLabel,
    areaCor: modalidade.areaCor,
    areaTag: modalidade.areaTag,
    ...(disciplina
      ? { disciplinaId: disciplina.id, disciplinaNome: disciplina.nome }
      : {}),
  };
}

function enriquecerDisciplina(
  disciplina: TrilhaDisciplinaItem,
  modalidade: TrilhaModalidadeItem,
): TrilhaDisciplinaCatalogo {
  return {
    ...disciplina,
    modalidadeId: modalidade.id,
    modalidadeNome: modalidade.nome,
    areaSlug: modalidade.areaSlug,
    areaLabel: modalidade.areaLabel,
    areaCor: modalidade.areaCor,
    areaTag: modalidade.areaTag,
  };
}

export const TRILHA_DISCIPLINAS: TrilhaDisciplinaCatalogo[] =
  CATALOGO_MODALIDADES.flatMap((modalidade) =>
    (modalidade.disciplinas ?? []).map((disciplina) =>
      enriquecerDisciplina(disciplina, modalidade),
    ),
  );

export const TRILHA_ASSUNTOS: TrilhaAssuntoCatalogo[] =
  CATALOGO_MODALIDADES.flatMap((modalidade) => {
    if (modalidade.disciplinas?.length) {
      return modalidade.disciplinas.flatMap((disciplina) =>
        disciplina.assuntos.map((assunto) =>
          enriquecerAssunto(assunto, modalidade, disciplina),
        ),
      );
    }

    return (modalidade.assuntos ?? []).map((assunto) =>
      enriquecerAssunto(assunto, modalidade),
    );
  });

export function modalidadeTemDisciplinas(
  modalidade: TrilhaModalidadeItem,
): boolean {
  return (modalidade.disciplinas?.length ?? 0) > 0;
}

export function contarAssuntosModalidade(modalidade: TrilhaModalidadeItem): number {
  if (modalidade.disciplinas?.length) {
    return modalidade.disciplinas.reduce(
      (total, disciplina) => total + disciplina.assuntos.length,
      0,
    );
  }
  return modalidade.assuntos?.length ?? 0;
}

export function getDisciplinaById(
  modalidadeId: string,
  disciplinaId: string,
): TrilhaDisciplinaCatalogo | undefined {
  return TRILHA_DISCIPLINAS.find(
    (item) =>
      item.modalidadeId === modalidadeId && item.id === disciplinaId,
  );
}

export function getModalidadeById(id: string): TrilhaModalidadeItem | undefined {
  return CATALOGO_MODALIDADES.find((item) => item.id === id);
}

export function getAssuntoById(id: string): TrilhaAssuntoCatalogo | undefined {
  return TRILHA_ASSUNTOS.find((item) => item.id === id);
}

function normalizarTextoAssunto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pontuarMatchAssunto(
  busca: string,
  assunto: TrilhaAssuntoCatalogo,
): number {
  const nome = normalizarTextoAssunto(assunto.nome);
  if (busca === nome) return 100;
  if (nome.startsWith(busca) || busca.startsWith(nome)) return 85;
  if (nome.includes(busca) || busca.includes(nome)) return 70;

  for (const palavra of assunto.palavrasChave) {
    const normalizada = normalizarTextoAssunto(palavra);
    if (busca.includes(normalizada) || normalizada.includes(busca)) return 55;
  }

  const modalidade = normalizarTextoAssunto(assunto.modalidadeNome);
  if (modalidade.includes(busca) || busca.includes(modalidade)) return 45;

  return 0;
}

export type ResolverAssuntoInput = {
  areaSlug: string;
  assuntoId?: string | null;
  disciplina?: string | null;
  modalidadeId?: string | null;
};

/** Resolve o assunto do catálogo para qualquer matéria/modalidade. */
export function resolverAssuntoNoCatalogo(
  input: ResolverAssuntoInput,
): TrilhaAssuntoCatalogo | undefined {
  const { areaSlug, assuntoId, disciplina, modalidadeId } = input;

  if (assuntoId) {
    const porId = getAssuntoById(assuntoId);
    if (porId?.areaSlug === areaSlug) return porId;
  }

  if (disciplina?.trim() && modalidadeId) {
    const porDisciplinaId = getDisciplinaById(modalidadeId, disciplina.trim());
    if (porDisciplinaId) return undefined;
  }

  const candidatos = TRILHA_ASSUNTOS.filter((item) => {
    if (item.areaSlug !== areaSlug) return false;
    if (modalidadeId && item.modalidadeId !== modalidadeId) return false;
    return true;
  });

  if (!disciplina?.trim()) return undefined;

  const busca = normalizarTextoAssunto(disciplina.trim());
  let melhor: { item: TrilhaAssuntoCatalogo; score: number } | undefined;

  for (const item of candidatos) {
    const score = pontuarMatchAssunto(busca, item);
    if (score > 0 && (!melhor || score > melhor.score)) {
      melhor = { item, score };
    }
  }

  return melhor && melhor.score >= 40 ? melhor.item : undefined;
}

/** Rótulo de estudo: "Inglês", "História", "Matemática" etc. */
export function getContextoEstudoAssunto(
  assunto: TrilhaAssuntoCatalogo,
): string {
  if (
    assunto.areaSlug === "linguagens" &&
    assunto.modalidadeId !== assunto.areaSlug
  ) {
    return assunto.modalidadeNome;
  }

  return assunto.areaLabel;
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

    if (modalidade.disciplinas?.length) {
      return modalidade.disciplinas.some(
        (disciplina) =>
          [disciplina.nome, ...disciplina.palavrasChave]
            .join(" ")
            .toLowerCase()
            .includes(busca) ||
          disciplina.assuntos.some((assunto) =>
            [assunto.nome, ...assunto.palavrasChave]
              .join(" ")
              .toLowerCase()
              .includes(busca),
          ),
      );
    }

    return (modalidade.assuntos ?? []).some((assunto) =>
      [assunto.nome, ...assunto.palavrasChave].join(" ").toLowerCase().includes(busca),
    );
  });
}

export function filtrarDisciplinasModalidade(
  modalidadeId: string,
  termo: string,
): TrilhaDisciplinaCatalogo[] {
  const modalidade = getModalidadeById(modalidadeId);
  if (!modalidade?.disciplinas?.length) return [];

  const busca = termo.trim().toLowerCase();
  const disciplinas = TRILHA_DISCIPLINAS.filter(
    (item) => item.modalidadeId === modalidadeId,
  );

  if (!busca) return disciplinas;

  return disciplinas.filter(
    (disciplina) =>
      [disciplina.nome, ...disciplina.palavrasChave]
        .join(" ")
        .toLowerCase()
        .includes(busca) ||
      disciplina.assuntos.some((assunto) =>
        [assunto.nome, ...assunto.palavrasChave]
          .join(" ")
          .toLowerCase()
          .includes(busca),
      ),
  );
}

export function filtrarAssuntosModalidade(
  modalidadeId: string,
  termo: string,
  disciplinaId?: string | null,
): TrilhaAssuntoCatalogo[] {
  const modalidade = getModalidadeById(modalidadeId);
  if (!modalidade) return [];

  const busca = termo.trim().toLowerCase();
  let assuntos = TRILHA_ASSUNTOS.filter(
    (item) => item.modalidadeId === modalidadeId,
  );

  if (disciplinaId) {
    assuntos = assuntos.filter((item) => item.disciplinaId === disciplinaId);
  }

  if (!busca) return assuntos;

  return assuntos.filter((assunto) =>
    [assunto.nome, ...assunto.palavrasChave]
      .join(" ")
      .toLowerCase()
      .includes(busca),
  );
}

export function calcularProgressoDisciplina(
  disciplina: TrilhaDisciplinaCatalogo,
  progressoPorAssunto: Record<string, number>,
): number {
  if (disciplina.assuntos.length === 0) return 0;

  const total = disciplina.assuntos.reduce(
    (soma, assunto) => soma + (progressoPorAssunto[assunto.id] ?? 0),
    0,
  );

  return Math.round(total / disciplina.assuntos.length);
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
export type TrilhaDisciplinaItemLegacy = TrilhaAssuntoCatalogo;

/** @deprecated Use TRILHA_ASSUNTOS */
export const TRILHA_CATALOGO = TRILHA_ASSUNTOS;
