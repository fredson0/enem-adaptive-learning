import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

const MOCK_SIMULADOS = [
  {
    id: "4",
    title: "Simulado #4",
    score: "34/45",
    status: "Concluído",
    date: "há 2 dias",
    area: "Geral",
  },
  {
    id: "3",
    title: "Simulado #3",
    score: "28/45",
    status: "Concluído",
    date: "há 5 dias",
    area: "Geral",
  },
];

export default function SimuladosPage() {
  return (
    <WorkspaceSection title="Simulados" count={MOCK_SIMULADOS.length}>
      <div className="space-y-8">
        <Link
          href="/simulados/novo"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <Plus className="size-4" strokeWidth={1.75} />
          Novo simulado
        </Link>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_SIMULADOS.map((simulado) => (
            <Link
              key={simulado.id}
              href={`/simulados/${simulado.id}`}
              className="group overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#161616] transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
            >
              <div className="relative flex aspect-[16/10] items-end bg-gradient-to-br from-[#222] via-[#171717] to-[#111] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(176,255,87,0.08),transparent_55%)]" />
                <div className="relative">
                  <p className="text-3xl font-medium tracking-tight text-white">
                    {simulado.score}
                  </p>
                  <p className="mt-1 text-sm text-white/40">{simulado.area}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {simulado.title}
                  </p>
                  <p className="mt-1 text-sm text-white/40">
                    {simulado.status} · {simulado.date}
                  </p>
                </div>
                <ChevronRight
                  className="size-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-white/55"
                  strokeWidth={1.75}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WorkspaceSection>
  );
}
