import { SimuladoNovoForm } from "@/components/simulados/simulado-novo-form";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { getModoBySlug } from "@/lib/simulado-modos";

export default function TreinoNovoPage() {
  const modo = getModoBySlug("treino")!;

  return (
    <WorkspaceSection title={`Novo · ${modo.shortLabel}`}>
      <SimuladoNovoForm modoSlug="treino" />
    </WorkspaceSection>
  );
}
