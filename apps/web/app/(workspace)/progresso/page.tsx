"use client";

import { ProgressoHub } from "@/components/progresso/progresso-hub";
import { ProgressoSkeleton } from "@/components/progresso/progresso-skeleton";
import { useProgressoData } from "@/components/progresso/use-progresso-data";
import { WorkspaceSection } from "@/components/workspace/workspace-section";

export default function ProgressoPage() {
  const { proficiencia, evolucao, lacunas, cobertura, loading, error, ready } =
    useProgressoData();

  return (
    <WorkspaceSection
      className="max-md:overflow-hidden"
      contentClassName="flex min-h-0 flex-1 flex-col pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-8"
    >
      {loading ? <ProgressoSkeleton variant="hub" /> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {ready && proficiencia && lacunas ? (
        <ProgressoHub
          proficiencia={proficiencia}
          evolucao={evolucao}
          lacunas={lacunas}
          cobertura={cobertura}
        />
      ) : null}
    </WorkspaceSection>
  );
}
