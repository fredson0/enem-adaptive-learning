"use client";

import { ProgressoRotinaView } from "@/components/progresso/progresso-rotina-view";
import { ProgressoSkeleton } from "@/components/progresso/progresso-skeleton";
import { useProgressoData } from "@/components/progresso/use-progresso-data";
import { WorkspaceSection } from "@/components/workspace/workspace-section";

export default function ProgressoRotinaPage() {
  const { proficiencia, evolucao, lacunas, trilha, cobertura, loading, error, ready } =
    useProgressoData();

  return (
    <WorkspaceSection contentClassName="flex min-h-0 flex-1 flex-col py-2 sm:py-4">
      {loading ? <ProgressoSkeleton /> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {ready && proficiencia && lacunas ? (
        <ProgressoRotinaView
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
