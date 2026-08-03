import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { MOCK_TRILHA } from "@/lib/workspace-mock";
import { ChevronRight } from "lucide-react";

export default function TrilhaPage() {
  return (
    <WorkspaceSection title="Trilha" count={MOCK_TRILHA.length}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MOCK_TRILHA.map((item) => (
          <div
            key={item.topic}
            className="group overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#161616] transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
          >
            <div className="relative flex aspect-[16/10] items-end bg-gradient-to-br from-[#222] via-[#171717] to-[#111] p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,107,107,0.08),transparent_55%)]" />
              <span className="relative rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/65 uppercase">
                {item.priority}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{item.topic}</p>
                <p className="mt-1 text-sm text-white/40">{item.area}</p>
              </div>
              <ChevronRight
                className="size-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-white/55"
                strokeWidth={1.75}
              />
            </div>
          </div>
        ))}
      </div>
    </WorkspaceSection>
  );
}
