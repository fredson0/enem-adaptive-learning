import { SimuladoNovoForm } from "@/components/simulados/simulado-novo-form";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { getModoBySlug } from "@/lib/simulado-modos";

export default function ModalidadeNovoPage() {
  const modo = getModoBySlug("modalidade")!;

  return (
    <WorkspaceSection title={`Novo · ${modo.shortLabel}`}>
      <SimuladoNovoForm modoSlug="modalidade" />
    </WorkspaceSection>
  );
}
