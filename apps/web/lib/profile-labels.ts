export const SERIE_ESCOLAR_OPTIONS = [
  { value: "PRIMEIRO_ANO", label: "1º ano do ensino médio" },
  { value: "SEGUNDO_ANO", label: "2º ano do ensino médio" },
  { value: "TERCEIRO_ANO", label: "3º ano do ensino médio" },
  { value: "NAO_ESTUDA", label: "Não estou na escola" },
] as const;

export const TIPO_ENSINO_MEDIO_OPTIONS = [
  { value: "PUBLICO", label: "Público" },
  { value: "PRIVADO", label: "Privado" },
  { value: "MISTO", label: "Misto (parte pública, parte privada)" },
] as const;

export type SerieEscolar = (typeof SERIE_ESCOLAR_OPTIONS)[number]["value"];
export type TipoEnsinoMedio = (typeof TIPO_ENSINO_MEDIO_OPTIONS)[number]["value"];

const SERIE_LABELS = Object.fromEntries(
  SERIE_ESCOLAR_OPTIONS.map((option) => [option.value, option.label]),
) as Record<SerieEscolar, string>;

const ENSINO_LABELS = Object.fromEntries(
  TIPO_ENSINO_MEDIO_OPTIONS.map((option) => [option.value, option.label]),
) as Record<TipoEnsinoMedio, string>;

const NIVEL_LABELS: Record<string, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

export function formatSerieEscolar(value: string | null | undefined) {
  if (!value) return "—";
  return SERIE_LABELS[value as SerieEscolar] ?? value;
}

export function formatTipoEnsinoMedio(value: string | null | undefined) {
  if (!value) return "—";
  return ENSINO_LABELS[value as TipoEnsinoMedio] ?? value;
}

export function formatNivelAtual(value: string | null | undefined) {
  if (!value) return "—";
  return NIVEL_LABELS[value] ?? value;
}
