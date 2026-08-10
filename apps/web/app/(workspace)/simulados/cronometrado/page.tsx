import { SimuladoLista } from "@/components/simulados/simulado-lista";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { getModoBySlug } from "@/lib/simulado-modos";

export default function CronometradoPage() {
  const modo = getModoBySlug("cronometrado")!;

  return (
    <WorkspaceSection title={modo.label}>
      <SimuladoLista modoSlug="cronometrado" />
    </WorkspaceSection>
  );
}
