"use client";

import { fetchTrilha, type TrilhaResponse } from "@/lib/trilha";
import { usarTrilhaAtualizada } from "@/lib/trilha-events";
import { TrilhaHero } from "@/components/trilha/trilha-hero";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const trilhaContentClass =
  "flex min-h-[calc(100vh-6rem)] flex-col justify-center py-6 md:py-10";

export default function TrilhaPage() {
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
      <WorkspaceSection contentClassName={trilhaContentClass}>
        <p className="text-center text-sm text-white/45">
          Montando sua trilha personalizada…
        </p>
      </WorkspaceSection>
    );
  }

  if (error || !data) {
    return (
      <WorkspaceSection contentClassName={trilhaContentClass}>
        <p className="text-center text-sm text-red-400">
          {error ?? "Trilha indisponível"}
        </p>
      </WorkspaceSection>
    );
  }

  return (
    <WorkspaceSection contentClassName={trilhaContentClass}>
      <div className="mx-auto w-full max-w-5xl">
        <TrilhaHero trilha={data} />
      </div>
    </WorkspaceSection>
  );
}
