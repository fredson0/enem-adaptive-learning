"use client";

import { ProgressoSkeleton } from "@/components/progresso/progresso-skeleton";
import { ProgressoView } from "@/components/progresso/progresso-view";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import {
  fetchCobertura,
  fetchEvolucao,
  fetchLacunas,
  fetchProficiencia,
  type CoberturaResponse,
  type LacunasResponse,
  type PontoEvolucao,
  type ProficienciaResponse,
} from "@/lib/metricas";
import { fetchTrilha, type TrilhaResponse } from "@/lib/trilha";
import { useEffect, useState } from "react";

export default function ProgressoPage() {
  const [proficiencia, setProficiencia] = useState<ProficienciaResponse | null>(
    null,
  );
  const [evolucao, setEvolucao] = useState<PontoEvolucao[]>([]);
  const [lacunas, setLacunas] = useState<LacunasResponse | null>(null);
  const [trilha, setTrilha] = useState<TrilhaResponse | null>(null);
  const [cobertura, setCobertura] = useState<CoberturaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchProficiencia(),
      fetchEvolucao(),
      fetchLacunas(),
      fetchTrilha().catch(() => null),
      fetchCobertura().catch(() => null),
    ])
      .then(([prof, evo, lac, trilhaData, coberturaData]) => {
        setProficiencia(prof);
        setEvolucao(evo.pontos);
        setLacunas(lac);
        setTrilha(trilhaData);
        setCobertura(coberturaData);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar progresso.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkspaceSection contentClassName="flex min-h-0 flex-1 flex-col py-2 sm:py-4">
      {loading ? <ProgressoSkeleton /> : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {proficiencia && lacunas ? (
        <ProgressoView
          proficiencia={proficiencia}
          evolucao={evolucao}
          lacunas={lacunas}
          trilha={trilha}
          cobertura={cobertura}
        />
      ) : null}
    </WorkspaceSection>
  );
}
