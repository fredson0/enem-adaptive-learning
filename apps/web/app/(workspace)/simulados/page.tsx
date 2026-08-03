import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import Link from "next/link";
import { Plus } from "lucide-react";

const MOCK_SIMULADOS = [
  { id: "4", title: "Simulado #4", score: "34/45", status: "Concluído", date: "há 2 dias" },
  { id: "3", title: "Simulado #3", score: "28/45", status: "Concluído", date: "há 5 dias" },
];

export default function SimuladosPage() {
  return (
    <>
      <WorkspaceTopbar
        title="Simulados"
        description="Gere simulados adaptativos e acompanhe seu histórico de preparação."
      />

      <div className="flex-1 space-y-6 p-6 md:p-8">
        <Link
          href="/simulados/novo"
          className="inline-flex items-center gap-2 rounded-[8px] bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <Plus className="size-4" strokeWidth={1.75} />
          Novo simulado
        </Link>

        <div className="grid gap-3">
          {MOCK_SIMULADOS.map((simulado) => (
            <div
              key={simulado.id}
              className="flex items-center justify-between rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] px-5 py-4"
            >
              <div>
                <p className="font-medium text-white">{simulado.title}</p>
                <p className="mt-1 text-sm text-white/45">
                  {simulado.status} · {simulado.date}
                </p>
              </div>
              <p className="text-lg font-medium text-white">{simulado.score}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
