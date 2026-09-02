"use client";

import { ProgressoFocoView } from "@/components/progresso/progresso-foco-view";
import { ProgressoSkeleton } from "@/components/progresso/progresso-skeleton";
import { useProgressoData } from "@/components/progresso/use-progresso-data";
import { WorkspaceSection } from "@/components/workspace/workspace-section";

export default function ProgressoFocoPage() {
  const { proficiencia, evolucao, lacunas, trilha, cobertura, loading, error, ready, setTrilha } =
    useProgressoData();

  return (
    <WorkspaceSection contentClassName="pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-8">
      {loading ? <ProgressoSkeleton /> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {ready && proficiencia && lacunas ? (
        <ProgressoFocoView
          proficiencia={proficiencia}
          evolucao={evolucao}
          lacunas={lacunas}
          trilha={trilha}
          cobertura={cobertura}
          onTrilhaAtualizada={setTrilha}
        />
      ) : null}
    </WorkspaceSection>
  );
}
