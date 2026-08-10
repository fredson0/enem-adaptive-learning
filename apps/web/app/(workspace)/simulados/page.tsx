import { SimuladoHubCard } from "@/components/simulados/simulado-hub-card";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { SIMULADO_MODOS } from "@/lib/simulado-modos";

export default function SimuladosHubPage() {
  return (
    <WorkspaceSection title="Simulados">
      <div className="max-w-4xl space-y-8">
        <p className="text-sm leading-relaxed text-white/55">
          Escolha o tipo de simulado. Cada modo tem histórico e configurações
          separados — treino livre, foco em uma área ou prova com cronômetro.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {SIMULADO_MODOS.map((modo) => (
            <SimuladoHubCard key={modo.slug} modoSlug={modo.slug} />
          ))}
        </div>
      </div>
    </WorkspaceSection>
  );
}
