"use client";

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
import { usarTrilhaAtualizada } from "@/lib/trilha-events";
import { useCallback, useEffect, useState } from "react";

export function useProgressoData() {
  const [proficiencia, setProficiencia] = useState<ProficienciaResponse | null>(
    null,
  );
  const [evolucao, setEvolucao] = useState<PontoEvolucao[]>([]);
  const [lacunas, setLacunas] = useState<LacunasResponse | null>(null);
  const [trilha, setTrilha] = useState<TrilhaResponse | null>(null);
  const [cobertura, setCobertura] = useState<CoberturaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recarregarTrilha = useCallback(() => {
    Promise.all([fetchTrilha().catch(() => null), fetchLacunas().catch(() => null)])
      .then(([trilhaData, lacunasData]) => {
        if (trilhaData) setTrilha(trilhaData);
        if (lacunasData) setLacunas(lacunasData);
      })
      .catch(() => undefined);
  }, []);

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

  useEffect(() => usarTrilhaAtualizada(recarregarTrilha), [recarregarTrilha]);

  return {
    proficiencia,
    evolucao,
    lacunas,
    trilha,
    cobertura,
    loading,
    error,
    ready: Boolean(proficiencia && lacunas),
    setTrilha,
  };
}
