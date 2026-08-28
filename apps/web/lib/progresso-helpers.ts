import type { PontoEvolucao, ProficienciaArea } from "@/lib/metricas";
import type { LacunaTrilha } from "@/lib/metricas";
import type { TrilhaResponse } from "@/lib/trilha";

export const AREA_CORES: Record<string, string> = {
  matematica: "#60a5fa",
  linguagens: "#f472b6",
  humanas: "#fbbf24",
  natureza: "#34d399",
};

export const AREA_SIGLAS: Record<string, string> = {
  matematica: "MAT",
  linguagens: "LIN",
  humanas: "HUM",
  natureza: "NAT",
};

export const AREA_ORDEM_RADAR = [
  "matematica",
  "natureza",
  "linguagens",
  "humanas",
] as const;

export type SegmentoArea = {
  slug: string;
  label: string;
  sigla: string;
  valor: number;
  cor: string;
};

export function montarSegmentosPorArea(
  areas: ProficienciaArea[],
): SegmentoArea[] {
  return areas
    .map((area) => ({
      slug: area.slug,
      label: area.label,
      sigla: AREA_SIGLAS[area.slug] ?? area.slug.slice(0, 3).toUpperCase(),
      valor: area.totalQuestoes,
      cor: AREA_CORES[area.slug] ?? "#ffffff",
    }))
    .filter((segmento) => segmento.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

export type DiaSemanaStatus = {
  label: string;
  ativo: boolean;
  hoje: boolean;
};

export type RitmoSemanal = {
  diasAtivosNaSemana: number;
  sequenciaAtual: number;
  melhorSequencia: number;
  dias: DiaSemanaStatus[];
};

const LABELS_DIA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(12, 0, 0, 0);
  return d;
}

/** Dias com prática na semana atual, sequência e melhor sequência. */
export function calcularRitmoSemanal(pontos: PontoEvolucao[]): RitmoSemanal {
  const activityDates = new Set<string>();
  for (const ponto of pontos) {
    activityDates.add(toDateKey(new Date(ponto.finalizadoEm)));
  }

  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  const hojeKey = toDateKey(hoje);
  const inicioSemana = startOfWeekMonday(hoje);

  const dias: DiaSemanaStatus[] = LABELS_DIA.map((label, index) => {
    const dia = new Date(inicioSemana);
    dia.setDate(dia.getDate() + index);
    const key = toDateKey(dia);
    return {
      label,
      ativo: activityDates.has(key),
      hoje: key === hojeKey,
    };
  });

  let sequenciaAtual = 0;
  const cursor = new Date(hoje);
  if (!activityDates.has(hojeKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activityDates.has(toDateKey(cursor))) {
    sequenciaAtual += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [...activityDates].sort();
  let melhorSequencia = 0;
  let atual = 0;
  let anterior: string | null = null;

  for (const key of sorted) {
    if (anterior) {
      const prev = new Date(`${anterior}T12:00:00`);
      const curr = new Date(`${key}T12:00:00`);
      const diff =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      atual = diff === 1 ? atual + 1 : 1;
    } else {
      atual = 1;
    }
    melhorSequencia = Math.max(melhorSequencia, atual);
    anterior = key;
  }

  return {
    diasAtivosNaSemana: dias.filter((dia) => dia.ativo).length,
    sequenciaAtual,
    melhorSequencia,
    dias,
  };
}

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

export type ComparativoSemanal = {
  simuladosSemanaAtual: number;
  simuladosSemanaAnterior: number;
  mediaSemanaAtual: number | null;
  mediaSemanaAnterior: number | null;
  deltaMedia: number | null;
};

function inicioSemana(date: Date): Date {
  return startOfWeekMonday(date);
}

/** Compara prática e média de acertos entre esta semana e a anterior. */
export function calcularComparativoSemanal(
  pontos: PontoEvolucao[],
): ComparativoSemanal {
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  const inicioAtual = inicioSemana(hoje);
  const inicioAnterior = new Date(inicioAtual);
  inicioAnterior.setDate(inicioAnterior.getDate() - 7);
  const fimAnterior = new Date(inicioAtual);
  fimAnterior.setMilliseconds(-1);

  const semanaAtual: PontoEvolucao[] = [];
  const semanaAnterior: PontoEvolucao[] = [];

  for (const ponto of pontos) {
    const data = new Date(ponto.finalizadoEm);
    if (data >= inicioAtual) {
      semanaAtual.push(ponto);
    } else if (data >= inicioAnterior && data <= fimAnterior) {
      semanaAnterior.push(ponto);
    }
  }

  const media = (lista: PontoEvolucao[]) => {
    if (lista.length === 0) return null;
    const soma = lista.reduce((acc, item) => acc + item.percentual, 0);
    return Math.round((soma / lista.length) * 10) / 10;
  };

  const mediaSemanaAtual = media(semanaAtual);
  const mediaSemanaAnterior = media(semanaAnterior);

  return {
    simuladosSemanaAtual: semanaAtual.length,
    simuladosSemanaAnterior: semanaAnterior.length,
    mediaSemanaAtual,
    mediaSemanaAnterior,
    deltaMedia:
      mediaSemanaAtual !== null && mediaSemanaAnterior !== null
        ? Math.round((mediaSemanaAtual - mediaSemanaAnterior) * 10) / 10
        : null,
  };
}

export type DiaLinhaTempo = {
  label: string;
  data: string;
  ativo: boolean;
  simulados: number;
  mediaPercentual: number | null;
};

/** Últimos 30 dias de atividade (simulados concluídos). */
export function montarLinhaTempo30Dias(pontos: PontoEvolucao[]): DiaLinhaTempo[] {
  const porDia = new Map<string, PontoEvolucao[]>();

  for (const ponto of pontos) {
    const key = toDateKey(new Date(ponto.finalizadoEm));
    const lista = porDia.get(key) ?? [];
    lista.push(ponto);
    porDia.set(key, lista);
  }

  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  const dias: DiaLinhaTempo[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const dia = new Date(hoje);
    dia.setDate(dia.getDate() - offset);
    const key = toDateKey(dia);
    const lista = porDia.get(key) ?? [];
    const media =
      lista.length > 0
        ? Math.round(
            (lista.reduce((acc, item) => acc + item.percentual, 0) /
              lista.length) *
              10,
          ) / 10
        : null;

    dias.push({
      label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(dia),
      data: key,
      ativo: lista.length > 0,
      simulados: lista.length,
      mediaPercentual: media,
    });
  }

  return dias;
}
