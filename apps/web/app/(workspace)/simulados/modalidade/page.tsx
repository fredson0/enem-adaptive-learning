import { SimuladoLista } from "@/components/simulados/simulado-lista";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { getModoBySlug } from "@/lib/simulado-modos";

export default function ModalidadePage() {
  const modo = getModoBySlug("modalidade")!;

  return (
    <WorkspaceSection title={modo.label}>
      <SimuladoLista modoSlug="modalidade" />
    </WorkspaceSection>
  );
}
