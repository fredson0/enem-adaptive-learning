import { TrilhaDiagnosticoWizard } from "@/components/trilha/trilha-diagnostico-wizard";
import { WorkspaceSection } from "@/components/workspace/workspace-section";

export default function TrilhaDiagnosticoPage() {
  return (
    <WorkspaceSection contentClassName="pt-6">
      <TrilhaDiagnosticoWizard />
    </WorkspaceSection>
  );
}
