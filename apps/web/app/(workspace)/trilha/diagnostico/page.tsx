import { TrilhaDiagnosticoWizard } from "@/components/trilha/trilha-diagnostico-wizard";
import { WorkspaceSection } from "@/components/workspace/workspace-section";

export default function TrilhaDiagnosticoPage() {
  return (
    <WorkspaceSection>
      <TrilhaDiagnosticoWizard />
    </WorkspaceSection>
  );
}
