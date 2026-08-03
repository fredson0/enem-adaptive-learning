import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { MOCK_PROFICIENCY } from "@/lib/workspace-mock";

export default function ProgressoPage() {
  return (
    <>
      <WorkspaceTopbar
        title="Progresso"
        description="Proficiência por área do ENEM com base nos seus simulados."
      />

      <div className="grid flex-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 md:p-8">
        {MOCK_PROFICIENCY.map((item) => (
          <div
            key={item.area}
            className="rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] p-5"
          >
            <p className="text-sm text-white/45">{item.area}</p>
            <p className="mt-2 text-3xl font-medium text-white">{item.value}%</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--osmo-hover)]">
              <div
                className="h-full rounded-full bg-white/80"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
