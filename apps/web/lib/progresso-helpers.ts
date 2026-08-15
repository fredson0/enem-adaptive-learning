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

/** Linha curta abaixo da média (tendência ou contexto). */
export function formatarLinhaTendencia(
  tendencia: TendenciaArea,
  simuladosConcluidos: number,
): string | null {
  if (simuladosConcluidos === 0) return null;
  if (simuladosConcluidos === 1) return "Primeiro simulado concluído";
  if (tendencia === null) return null;
  if (tendencia > 0) return `+${tendencia}% desde o último simulado`;
  if (tendencia < 0) return `${tendencia}% desde o último simulado`;
  return "Estável no último simulado";
}

/** Uma frase de contexto — lacuna ou incentivo. */
export function montarSubtituloProgresso(
  lacunaPrincipal: LacunaTrilha | null,
): string {
  if (!lacunaPrincipal) {
    return "Mantenha o ritmo com treinos curtos.";
  }

  if (lacunaPrincipal.prioridade === "Alta") {
    return `Maior lacuna: ${lacunaPrincipal.label}.`;
  }

  const mensagem = lacunaPrincipal.mensagem.trim();
  const primeiraFrase = mensagem.split(/(?<=[.!?])\s+/)[0];
  return primeiraFrase || mensagem;
}

/** @deprecated Use média + formatarLinhaTendencia + montarSubtituloProgresso */
export function montarTituloHero(input: {
  simuladosConcluidos: number;
  mediaGeral: number | null;
  tendenciaGeral: TendenciaArea;
  lacunaPrincipal: LacunaTrilha | null;
}): { titulo: string; subtitulo: string } {
  if (input.simuladosConcluidos === 0) {
    return {
      titulo: "Comece hoje",
      subtitulo: "5 questões bastam para ver seu mapa de proficiência.",
    };
  }

  const media = input.mediaGeral ?? 0;
  return {
    titulo: `Você está em ${media}%`,
    subtitulo: montarSubtituloProgresso(input.lacunaPrincipal),
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
