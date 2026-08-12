import type { TrilhaEtapa } from './trilha.config';

/** "Filosofia", "Filosofia e Atualidades", "A, B e C" */
export function formatarListaAssuntos(assuntos: string[]): string {
  const lista = assuntos.filter(Boolean);
  if (lista.length === 0) return 'os tópicos mais cobrados';
  if (lista.length === 1) return lista[0];
  if (lista.length === 2) return `${lista[0]} e ${lista[1]}`;
  return `${lista.slice(0, -1).join(', ')} e ${lista[lista.length - 1]}`;
}

export function formatarPerguntaTutor(label: string, assuntos: string[]): string {
  const lista = formatarListaAssuntos(assuntos);
  if (assuntos.length <= 1) {
    return `Estou montando minha trilha no ENEM+. Minha maior dificuldade em ${label} é ${lista}. Por onde devo começar a estudar?`;
  }
  return `Estou montando minha trilha no ENEM+. Minhas maiores dificuldades em ${label} são ${lista}. Por onde devo começar a estudar?`;
}

export function montarMetaSemanalDinamica(input: {
  minutosPorDia: number;
  areaLabel: string;
  disciplinas: string[];
  proximaEtapa?: TrilhaEtapa | null;
  metaIa?: string;
}): string {
  if (input.metaIa?.trim()) return input.metaIa.trim();

  const assuntos = formatarListaAssuntos(input.disciplinas.slice(0, 2));
  const etapa = input.proximaEtapa;

  if (etapa) {
    return `Esta semana: ${input.minutosPorDia} min/dia em ${input.areaLabel} (${assuntos}) — agora: ${etapa.titulo.toLowerCase()}.`;
  }

  return `Esta semana: ${input.minutosPorDia} min/dia em ${input.areaLabel} (${assuntos}) — revise etapas concluídas ou avance para outra área.`;
}
