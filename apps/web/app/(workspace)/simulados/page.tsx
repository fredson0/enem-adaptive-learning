import { SimuladoHubCard } from "@/components/simulados/simulado-hub-card";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { SIMULADO_MODOS } from "@/lib/simulado-modos";

export default function SimuladosHubPage() {
  return (
    <WorkspaceSection title="Simulados">
      <div className="mx-auto max-w-5xl space-y-12">
        <p className="text-center text-sm leading-relaxed text-white/45">
          Escolha o modo. Cada um tem histórico e configurações separados.
        </p>

        <div className="flex flex-wrap items-start justify-center gap-8 md:gap-6 lg:gap-8">
          {SIMULADO_MODOS.map((modo) => (
            <SimuladoHubCard key={modo.slug} modoSlug={modo.slug} />
          ))}
        </div>
      </div>
    </WorkspaceSection>
  );
}
