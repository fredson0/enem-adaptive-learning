"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { apiFetch } from "@/lib/api";
import {
  formatArea,
  formatSimuladoStatus,
  type SimuladoResumo,
} from "@/lib/simulados";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function SimuladosPage() {
  const [simulados, setSimulados] = useState<SimuladoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SimuladoResumo[]>("/simulados", { auth: true })
      .then(setSimulados)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar simulados.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkspaceSection title="Simulados" count={simulados.length}>
      <div className="space-y-8">
        <Link
          href="/simulados/novo"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <Plus className="size-4" strokeWidth={1.75} />
          Novo simulado
        </Link>

        {loading ? (
          <p className="text-sm text-white/45">Carregando histórico…</p>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!loading && simulados.length === 0 ? (
          <p className="text-sm text-white/45">
            Você ainda não fez nenhum simulado. Comece criando um novo!
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {simulados.map((simulado) => {
            const href =
              simulado.status === "CONCLUIDO"
                ? `/simulados/${simulado.id}/resultado`
                : `/simulados/${simulado.id}`;

            return (
              <Link
                key={simulado.id}
                href={href}
                className="group overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#161616] transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
              >
                <div className="relative flex aspect-[16/10] items-end bg-gradient-to-br from-[#222] via-[#171717] to-[#111] p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(176,255,87,0.08),transparent_55%)]" />
                  <div className="relative">
                    <p className="text-3xl font-medium tracking-tight text-white">
                      {simulado.status === "CONCLUIDO"
                        ? `${simulado.acertos}/${simulado.totalQuestoes}`
                        : `${simulado.respondidas}/${simulado.totalQuestoes}`}
                    </p>
                    <p className="mt-1 text-sm text-white/40">
                      {formatArea(simulado.area)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      Simulado · {formatArea(simulado.area)}
                    </p>
                    <p className="mt-1 text-sm text-white/40">
                      {formatSimuladoStatus(simulado.status)} ·{" "}
                      {formatDate(simulado.iniciadoEm)}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-white/55"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </WorkspaceSection>
  );
}
