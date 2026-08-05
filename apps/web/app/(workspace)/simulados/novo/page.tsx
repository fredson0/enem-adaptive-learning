"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { apiFetch } from "@/lib/api";
import { AREA_OPTIONS, QUANTIDADE_OPTIONS } from "@/lib/simulados";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovoSimuladoPage() {
  const router = useRouter();
  const [area, setArea] = useState<string>("matematica");
  const [quantidade, setQuantidade] = useState<number>(10);
  const [ano, setAno] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await apiFetch<{ id: string }>("/simulados", {
        method: "POST",
        auth: true,
        body: {
          area,
          quantidade,
          ...(ano ? { ano: Number(ano) } : {}),
        },
      });

      router.push(`/simulados/${result.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível criar o simulado.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceSection title="Novo simulado">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-6 rounded-[14px] border border-white/[0.06] bg-[#161616] p-8"
      >
        <p className="text-sm text-white/50">
          Escolha a área e a quantidade de questões. O sistema sorteia do banco
          local (ENEM).
        </p>

        <label className="block">
          <span className="text-sm text-white/55">Área</span>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
          >
            {AREA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-white/55">Quantidade de questões</span>
          <select
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
          >
            {QUANTIDADE_OPTIONS.map((qtd) => (
              <option key={qtd} value={qtd}>
                {qtd} questões
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-white/55">Ano (opcional)</span>
          <input
            type="number"
            min={2009}
            max={2023}
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            placeholder="Ex.: 2023"
            className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Gerando…" : "Começar simulado"}
        </button>
      </form>
    </WorkspaceSection>
  );
}
