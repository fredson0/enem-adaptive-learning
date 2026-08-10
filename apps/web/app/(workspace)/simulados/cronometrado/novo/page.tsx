import { SimuladoNovoForm } from "@/components/simulados/simulado-novo-form";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { getModoBySlug } from "@/lib/simulado-modos";

export default function CronometradoNovoPage() {
  const modo = getModoBySlug("cronometrado")!;

  return (
    <WorkspaceSection title={`Novo · ${modo.shortLabel}`}>
      <SimuladoNovoForm modoSlug="cronometrado" />
    </WorkspaceSection>
  );
}
