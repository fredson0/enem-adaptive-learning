"use client";

import { SimuladoCard } from "@/components/simulados/simulado-card";
import type { ModoSimuladoSlug } from "@/lib/simulado-modos";
import { getModoBySlug } from "@/lib/simulado-modos";
import { listarSimulados } from "@/lib/simulados-api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SimuladoListaProps = {
  modoSlug: ModoSimuladoSlug;
};

export function SimuladoLista({ modoSlug }: SimuladoListaProps) {
  const modo = getModoBySlug(modoSlug)!;
  const [items, setItems] = useState<Awaited<ReturnType<typeof listarSimulados>>["items"]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "EM_ANDAMENTO" | "CONCLUIDO">("todos");

  useEffect(() => {
    setLoading(true);
    setError(null);
    listarSimulados({
      modo: modo.api,
      status: filtroStatus === "todos" ? undefined : filtroStatus,
      limit: 30,
    })
      .then((response) => {
        const itemsFiltrados = response.items.filter(
          (simulado) => simulado.modo === modo.api,
        );
        setItems(itemsFiltrados);
        setTotal(itemsFiltrados.length);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar simulados.",
        ),
      )
      .finally(() => setLoading(false));
  }, [modo.api, filtroStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={modo.novoHref}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <Plus className="size-4" strokeWidth={1.75} />
          Novo {modo.shortLabel.toLowerCase()}
        </Link>

        <div className="flex gap-1 rounded-full border border-white/10 bg-[#111] p-1">
          {(
            [
              ["todos", "Todos"],
              ["EM_ANDAMENTO", "Em andamento"],
              ["CONCLUIDO", "Concluídos"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFiltroStatus(value)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                filtroStatus === value
                  ? "bg-white text-black"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-[14px] border border-white/[0.06] bg-[#161616]"
            />
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-white/10 bg-[#161616]/50 px-6 py-10 text-center">
          <p className="text-sm text-white/55">
            Nenhum simulado de {modo.shortLabel.toLowerCase()} ainda.
          </p>
          <p className="mt-2 text-xs text-white/35">{modo.description}</p>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <p className="text-xs text-white/35">
            {total} simulado{total === 1 ? "" : "s"} no histórico
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((simulado) => (
              <SimuladoCard key={simulado.id} simulado={simulado} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
