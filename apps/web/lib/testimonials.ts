import type { DesignTestimonialItem } from "@/components/ui/design-testimonial";

export const MOCK_TESTIMONIALS: DesignTestimonialItem[] = [
  {
    quote:
      "Pela primeira vez entendi onde estava errando de verdade. As métricas por área mudaram como eu organizo a semana de estudo.",
    author: "Ana Clara",
    role: "3º ano — escola pública, SP",
  },
  {
    quote:
      "O tutor IA não dá resposta pronta — ele me guia no raciocínio. Parece ter um professor do meu lado quando travo numa questão.",
    author: "Lucas M.",
    role: "Vestibulando, MG",
  },
  {
    quote:
      "Simulado + trilha no mesmo lugar economiza tempo. Estudo o que importa em vez de ficar pulando de matéria sem critério.",
    author: "Juliana R.",
    role: "Cursinho + ENEM+, RJ",
  },
];

export type DepoimentosPublicosResponse = {
  depoimentos: DesignTestimonialItem[];
  totalReais: number;
  totalMocks: number;
};

export function mergeTestimonials(
  mocks: DesignTestimonialItem[],
  reals: DesignTestimonialItem[],
): DesignTestimonialItem[] {
  const merged = mocks.map((mock) => ({ ...mock }));

  for (let index = 0; index < reals.length; index += 1) {
    if (index < merged.length) {
      merged[index] = reals[index];
    } else {
      merged.push(reals[index]);
    }
  }

  return merged;
}
