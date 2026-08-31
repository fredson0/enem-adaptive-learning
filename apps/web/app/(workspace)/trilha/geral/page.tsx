"use client";

import { TrilhaGeralVault } from "@/components/trilha/trilha-geral-vault";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { fetchTrilha, type TrilhaResponse } from "@/lib/trilha";
import { usarTrilhaAtualizada } from "@/lib/trilha-events";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function TrilhaGeralPage() {
  const router = useRouter();
  const [data, setData] = useState<TrilhaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarTrilha = useCallback(() => {
    return fetchTrilha()
      .then((response) => {
        if (!response.diagnosticoCompleto) {
          router.replace("/trilha/diagnostico");
          return null;
        }
        setData(response);
        return response;
      });
  }, [router]);

  useEffect(() => {
    carregarTrilha()
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar a trilha.",
        ),
      )
      .finally(() => setLoading(false));
  }, [carregarTrilha]);

  useEffect(() => {
    return usarTrilhaAtualizada(() => {
      carregarTrilha().catch(() => undefined);
    });
  }, [carregarTrilha]);

  if (loading) {
    return (
      <WorkspaceSection>
        <p className="text-sm text-white/45">Carregando trilha geral…</p>
      </WorkspaceSection>
    );
  }

  if (error || !data) {
    return (
      <WorkspaceSection>
        <p className="text-sm text-red-400">{error ?? "Trilha indisponível"}</p>
      </WorkspaceSection>
    );
  }

  return (
    <WorkspaceSection>
      <TrilhaGeralVault
        trilha={data}
        onTrilhaAtualizada={(trilha) => setData(trilha)}
      />
    </WorkspaceSection>
  );
}
