import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { MOCK_USER } from "@/lib/workspace-mock";

export default function PerfilPage() {
  return (
    <>
      <WorkspaceTopbar
        title="Perfil"
        description="Seus dados de aluno e configurações da conta."
      />

      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-xl rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-[var(--osmo-active)] text-lg font-semibold text-white">
              MS
            </div>
            <div>
              <p className="text-lg font-medium text-white">{MOCK_USER.name}</p>
              <p className="text-sm text-white/45">{MOCK_USER.email}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-white/45">Plano atual</p>
              <p className="mt-1 text-white">{MOCK_USER.plan}</p>
            </div>
            <div>
              <p className="text-white/45">Escola</p>
              <p className="mt-1 text-white">EE Prof. João da Silva (pública)</p>
            </div>
            <div>
              <p className="text-white/45">Série</p>
              <p className="mt-1 text-white">3º ano — ENEM 2026</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
