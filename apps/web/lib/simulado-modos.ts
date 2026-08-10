import {
  ClipboardList,
  Clock,
  Target,
  type LucideIcon,
} from "lucide-react";

export type ModoSimuladoSlug = "treino" | "modalidade" | "cronometrado";

export type ModoSimuladoApi = "TREINO" | "MODALIDADE" | "CRONOMETRADO";

export type ModoSimuladoConfig = {
  slug: ModoSimuladoSlug;
  api: ModoSimuladoApi;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  href: string;
  novoHref: string;
  areaObrigatoria: boolean;
  quantidades: readonly number[];
  permitePedidoIa: boolean;
  revelaGabaritoImediato: boolean;
  usaCronometro: boolean;
};

export const SIMULADO_MODOS: ModoSimuladoConfig[] = [
  {
    slug: "treino",
    api: "TREINO",
    label: "Treino livre",
    shortLabel: "Treino",
    description:
      "Pratique sem pressão: gabarito após cada resposta, área opcional e pedidos à IA.",
    icon: ClipboardList,
    href: "/simulados/treino",
    novoHref: "/simulados/treino/novo",
    areaObrigatoria: false,
    quantidades: [5, 10, 20],
    permitePedidoIa: true,
    revelaGabaritoImediato: true,
    usaCronometro: false,
  },
  {
    slug: "modalidade",
    api: "MODALIDADE",
    label: "Modalidade específica",
    shortLabel: "Modalidade",
    description:
      "Foco em uma área do ENEM (Linguagens, Humanas, Natureza ou Matemática).",
    icon: Target,
    href: "/simulados/modalidade",
    novoHref: "/simulados/modalidade/novo",
    areaObrigatoria: true,
    quantidades: [10, 20, 45],
    permitePedidoIa: true,
    revelaGabaritoImediato: true,
    usaCronometro: false,
  },
  {
    slug: "cronometrado",
    api: "CRONOMETRADO",
    label: "Com cronômetro",
    shortLabel: "Cronômetro",
    description:
      "Simula a prova: tempo limitado (~4 min/questão) e gabarito só no final.",
    icon: Clock,
    href: "/simulados/cronometrado",
    novoHref: "/simulados/cronometrado/novo",
    areaObrigatoria: true,
    quantidades: [10, 20, 45],
    permitePedidoIa: false,
    revelaGabaritoImediato: false,
    usaCronometro: true,
  },
];

export function getModoBySlug(slug: string): ModoSimuladoConfig | undefined {
  return SIMULADO_MODOS.find((modo) => modo.slug === slug);
}

export function getModoByApi(api: ModoSimuladoApi): ModoSimuladoConfig | undefined {
  return SIMULADO_MODOS.find((modo) => modo.api === api);
}

export function formatModoSimulado(api: ModoSimuladoApi | string) {
  return getModoByApi(api as ModoSimuladoApi)?.label ?? String(api);
}

export function segundosParaTempoLegivel(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  if (minutos >= 60) {
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    return `${horas}h ${min}min`;
  }
  return resto > 0 ? `${minutos}min ${resto}s` : `${minutos}min`;
}
