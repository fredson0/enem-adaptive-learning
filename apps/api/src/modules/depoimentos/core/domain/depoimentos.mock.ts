export type DepoimentoItem = {
  quote: string;
  author: string;
  role: string;
  isReal?: boolean;
};

export const DEPOIMENTOS_MOCK: DepoimentoItem[] = [
  {
    quote:
      "Pela primeira vez entendi onde estava errando de verdade. As métricas por área mudaram como eu organizo a semana de estudo.",
    author: "Ana Clara",
    role: "3º ano — escola pública, SP",
    isReal: false,
  },
  {
    quote:
      "O tutor IA não dá resposta pronta — ele me guia no raciocínio. Parece ter um professor do meu lado quando travo numa questão.",
    author: "Lucas M.",
    role: "Vestibulando, MG",
    isReal: false,
  },
  {
    quote:
      "Simulado + trilha no mesmo lugar economiza tempo. Estudo o que importa em vez de ficar pulando de matéria sem critério.",
    author: "Juliana R.",
    role: "Cursinho + ENEM+, RJ",
    isReal: false,
  },
];

export function mesclarDepoimentosComMocks(
  mocks: DepoimentoItem[],
  reais: DepoimentoItem[],
): DepoimentoItem[] {
  const resultado = mocks.map((mock) => ({ ...mock }));

  for (let index = 0; index < reais.length; index += 1) {
    if (index < resultado.length) {
      resultado[index] = { ...reais[index], isReal: true };
    } else {
      resultado.push({ ...reais[index], isReal: true });
    }
  }

  return resultado;
}
