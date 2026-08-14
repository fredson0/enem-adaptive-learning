"use client";

import { ProgressoDetalheView } from "@/components/progresso/progresso-view";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import {
  fetchEvolucao,
  fetchLacunas,
  fetchProficiencia,
  type LacunasResponse,
  type PontoEvolucao,
  type ProficienciaResponse,
} from "@/lib/metricas";
import { fetchTrilha, type TrilhaResponse } from "@/lib/trilha";
import { useEffect, useState } from "react";

export default function ProgressoDetalhesPage() {
  const [proficiencia, setProficiencia] = useState<ProficienciaResponse | null>(
    null,
  );
  const [evolucao, setEvolucao] = useState<PontoEvolucao[]>([]);
  const [lacunas, setLacunas] = useState<LacunasResponse | null>(null);
  const [trilha, setTrilha] = useState<TrilhaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchProficiencia(),
      fetchEvolucao(),
      fetchLacunas(),
      fetchTrilha().catch(() => null),
    ])
      .then(([prof, evo, lac, trilhaData]) => {
        setProficiencia(prof);
        setEvolucao(evo.pontos);
        setLacunas(lac);
        setTrilha(trilhaData);
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
    <WorkspaceSection>
      {loading ? (
        <p className="text-sm text-white/45">Carregando análise…</p>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {proficiencia && lacunas ? (
        <ProgressoDetalheView
          proficiencia={proficiencia}
          evolucao={evolucao}
          lacunas={lacunas}
          trilha={trilha}
        />
      ) : null}
    </WorkspaceSection>
  );
}
