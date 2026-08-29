import type {
  CoberturaResponse,
  LacunasResponse,
  ProficienciaResponse,
  PontoEvolucao,
} from "@/lib/metricas";
import type { TrilhaResponse } from "@/lib/trilha";

export type ProgressoDataProps = {
  proficiencia: ProficienciaResponse;
  evolucao: PontoEvolucao[];
  lacunas: LacunasResponse;
  trilha: TrilhaResponse | null;
  cobertura?: CoberturaResponse | null;
};

export { ProgressoDesempenhoView } from "@/components/progresso/progresso-desempenho-view";
export { ProgressoFocoView } from "@/components/progresso/progresso-foco-view";
export { ProgressoHub } from "@/components/progresso/progresso-hub";
export { ProgressoRotinaView } from "@/components/progresso/progresso-rotina-view";
