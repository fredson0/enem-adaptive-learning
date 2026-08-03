import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { MOCK_TRILHA } from "@/lib/workspace-mock";

export default function TrilhaPage() {
  return (
    <>
      <WorkspaceTopbar
        title="Minha Trilha"
        description="Foco de estudo baseado nas suas lacunas de conhecimento."
      />

      <div className="flex-1 space-y-4 p-6 md:p-8">
        {MOCK_TRILHA.map((item) => (
          <div
            key={item.topic}
            className="rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] px-5 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">{item.topic}</p>
                <p className="mt-1 text-sm text-white/45">{item.area}</p>
              </div>
              <span className="rounded-[4px] bg-[var(--osmo-active)] px-2 py-1 text-[10px] font-semibold tracking-wide text-white/70 uppercase">
                {item.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
