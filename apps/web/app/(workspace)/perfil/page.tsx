import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { MOCK_USER } from "@/lib/workspace-mock";

export default function PerfilPage() {
  return (
    <WorkspaceSection title="Perfil">
      <div className="max-w-xl rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 md:p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#252525] text-lg font-semibold text-white">
            MS
          </div>
          <div>
            <p className="text-lg font-medium text-white">{MOCK_USER.name}</p>
            <p className="text-sm text-white/45">{MOCK_USER.email}</p>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <p className="text-white/40">Plano atual</p>
            <p className="mt-1.5 text-white">{MOCK_USER.plan}</p>
          </div>
          <div>
            <p className="text-white/40">Escola</p>
            <p className="mt-1.5 text-white">EE Prof. João da Silva (pública)</p>
          </div>
          <div>
            <p className="text-white/40">Série</p>
            <p className="mt-1.5 text-white">3º ano — ENEM 2026</p>
          </div>
        </div>
      </div>
    </WorkspaceSection>
  );
}
