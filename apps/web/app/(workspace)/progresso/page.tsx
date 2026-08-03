import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { MOCK_PROFICIENCY } from "@/lib/workspace-mock";

export default function ProgressoPage() {
  return (
    <WorkspaceSection title="Progresso" count={MOCK_PROFICIENCY.length}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MOCK_PROFICIENCY.map((item) => (
          <div
            key={item.area}
            className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
          >
            <p className="text-sm text-white/45">{item.area}</p>
            <p className="mt-3 text-4xl font-medium tracking-tight text-white">
              {item.value}
              <span className="text-xl text-white/35">%</span>
            </p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-white/80"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </WorkspaceSection>
  );
}
