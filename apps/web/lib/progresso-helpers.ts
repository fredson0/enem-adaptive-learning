import type { PontoEvolucao, ProficienciaArea } from "@/lib/metricas";
import type { LacunaTrilha } from "@/lib/metricas";
import type { TrilhaResponse } from "@/lib/trilha";

export const AREA_CORES: Record<string, string> = {
  matematica: "#60a5fa",
  linguagens: "#f472b6",
  humanas: "#fbbf24",
  natureza: "#34d399",
};

export type TendenciaArea = number | null;

/** Delta entre os dois últimos simulados da mesma área. */
export function calcularTendenciasPorArea(
  pontos: PontoEvolucao[],
): Map<string, TendenciaArea> {
  const porArea = new Map<string, number[]>();

  for (const ponto of pontos) {
    if (!ponto.slug) continue;
    const lista = porArea.get(ponto.slug) ?? [];
    lista.push(ponto.percentual);
    porArea.set(ponto.slug, lista);
  }

  const tendencias = new Map<string, TendenciaArea>();
  for (const [slug, valores] of porArea) {
    if (valores.length < 2) {
      tendencias.set(slug, null);
      continue;
    }
    const atual = valores[valores.length - 1];
    const anterior = valores[valores.length - 2];
    tendencias.set(slug, Math.round((atual - anterior) * 10) / 10);
  }

  return tendencias;
}

export function calcularTendenciaGeral(pontos: PontoEvolucao[]): TendenciaArea {
  if (pontos.length < 2) return null;
  const ordenados = [...pontos].sort(
    (a, b) =>
      new Date(a.finalizadoEm).getTime() - new Date(b.finalizadoEm).getTime(),
  );
  const atual = ordenados[ordenados.length - 1].percentual;
  const anterior = ordenados[ordenados.length - 2].percentual;
  return Math.round((atual - anterior) * 10) / 10;
}

export function montarTituloHero(input: {
  simuladosConcluidos: number;
  mediaGeral: number | null;
  tendenciaGeral: TendenciaArea;
  lacunaPrincipal: LacunaTrilha | null;
}): { titulo: string; subtitulo: string } {
  if (input.simuladosConcluidos === 0) {
    return {
      titulo: "Seu progresso começa com o primeiro simulado",
      subtitulo:
        "Responda 5 questões e liberamos seu mapa de proficiência por área.",
    };
  }

  if (input.mediaGeral === null) {
    return {
      titulo: "Continue praticando para ver sua média",
      subtitulo: input.lacunaPrincipal?.mensagem ?? "Faça mais simulados focados.",
    };
  }

  if (input.tendenciaGeral !== null && input.tendenciaGeral > 0) {
    return {
      titulo: `Sua média subiu ${input.tendenciaGeral}% no último simulado`,
      subtitulo:
        input.lacunaPrincipal?.prioridade === "Alta"
          ? `Ainda vale reforçar ${input.lacunaPrincipal.label} esta semana.`
          : "Bom ritmo — mantenha revisões curtas nos erros.",
    };
  }

  if (input.tendenciaGeral !== null && input.tendenciaGeral < 0) {
    return {
      titulo: `Último simulado ficou ${Math.abs(input.tendenciaGeral)}% abaixo do anterior`,
      subtitulo:
        input.lacunaPrincipal?.mensagem ??
        "Revise os erros antes do próximo treino.",
    };
  }

  return {
    titulo: `Média geral de ${input.mediaGeral}% nos simulados`,
    subtitulo:
      input.lacunaPrincipal?.mensagem ??
      "Estável — hora de variar áreas ou intensificar o foco.",
  };
}

export function obterProximaAcaoTrilha(trilha: TrilhaResponse | null) {
  if (!trilha?.diagnosticoCompleto) return null;

  const area =
    trilha.areas.find((item) => item.slug === trilha.areaPrioritaria) ??
    trilha.areas[0];

  if (!area?.proximaEtapa?.href) return null;

  return {
    titulo: area.proximaEtapa.titulo,
    href: area.proximaEtapa.href,
    areaLabel: area.label,
  };
}

export function ordenarAreasPorPrioridade(
  areas: ProficienciaArea[],
  lacunas: LacunaTrilha[],
): ProficienciaArea[] {
  const ordem = new Map(lacunas.map((item, index) => [item.slug, index]));

  return [...areas].sort((a, b) => {
    const pa = ordem.get(a.slug) ?? 99;
    const pb = ordem.get(b.slug) ?? 99;
    if (pa !== pb) return pa - pb;
    return a.score - b.score;
  });
}

export function formatDateCurta(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}
