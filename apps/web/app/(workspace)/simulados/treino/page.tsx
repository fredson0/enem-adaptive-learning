import { SimuladoLista } from "@/components/simulados/simulado-lista";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { getModoBySlug } from "@/lib/simulado-modos";

export default function TreinoPage() {
  const modo = getModoBySlug("treino")!;

  return (
    <WorkspaceSection title={modo.label}>
      <SimuladoLista modoSlug="treino" />
    </WorkspaceSection>
  );
}
