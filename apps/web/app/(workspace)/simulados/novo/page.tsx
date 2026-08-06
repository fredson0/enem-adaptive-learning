"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { apiFetch } from "@/lib/api";
import {
  ANOS_ENEM,
  AREA_OPTIONS,
  QUANTIDADE_OPTIONS,
  type SimuladoGeradoComIa,
} from "@/lib/simulados";
import { cn } from "@/lib/utils";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Modo = "ia" | "manual";

const EXEMPLOS_IA = [
  "10 questões de matemática sobre funções, de todos os anos",
  "5 questões de eletromagnetismo em ciências da natureza",
  "Questões de interpretação de texto em linguagens, anos 2018 a 2022",
];

function NovoSimuladoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modo, setModo] = useState<Modo>("ia");
  const [area, setArea] = useState<string>("matematica");
  const [quantidade, setQuantidade] = useState<number>(10);
  const [anosSelecionados, setAnosSelecionados] = useState<number[]>([]);
  const [termosBusca, setTermosBusca] = useState("");
  const [pedidoIa, setPedidoIa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewIa, setPreviewIa] = useState<SimuladoGeradoComIa["plano"] | null>(
    null,
  );

  useEffect(() => {
    const areaParam = searchParams.get("area");
    const quantidadeParam = searchParams.get("quantidade");

    if (areaParam && AREA_OPTIONS.some((option) => option.value === areaParam)) {
      setArea(areaParam);
    }

    if (quantidadeParam) {
      const parsed = Number(quantidadeParam);
      if (QUANTIDADE_OPTIONS.includes(parsed as (typeof QUANTIDADE_OPTIONS)[number])) {
        setQuantidade(parsed);
      }
    }
  }, [searchParams]);

  const toggleAno = (ano: number) => {
    setAnosSelecionados((prev) =>
      prev.includes(ano) ? prev.filter((a) => a !== ano) : [...prev, ano],
    );
  };

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const termos = termosBusca
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const result = await apiFetch<{ id: string }>("/simulados", {
        method: "POST",
        auth: true,
        body: {
          area,
          quantidade,
          ...(anosSelecionados.length ? { anos: anosSelecionados } : {}),
          ...(termos.length ? { termosBusca: termos } : {}),
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

  const handleIaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPreviewIa(null);

    try {
      const result = await apiFetch<SimuladoGeradoComIa>("/simulados/gerar-com-ia", {
        method: "POST",
        auth: true,
        body: { pedido: pedidoIa },
      });

      setPreviewIa(result.plano);
      router.push(`/simulados/${result.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível gerar o simulado.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex gap-2 rounded-full border border-white/10 bg-[#111] p-1">
        <button
          type="button"
          onClick={() => setModo("ia")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm transition",
            modo === "ia"
              ? "bg-white text-black"
              : "text-white/55 hover:text-white",
          )}
        >
          <Sparkles className="size-4" strokeWidth={1.75} />
          Pedir à IA
        </button>
        <button
          type="button"
          onClick={() => setModo("manual")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm transition",
            modo === "manual"
              ? "bg-white text-black"
              : "text-white/55 hover:text-white",
          )}
        >
          <SlidersHorizontal className="size-4" strokeWidth={1.75} />
          Filtros manuais
        </button>
      </div>

      {modo === "ia" ? (
        <form
          onSubmit={handleIaSubmit}
          className="space-y-6 rounded-[14px] border border-white/[0.06] bg-[#161616] p-8"
        >
          <p className="text-sm text-white/50">
            Descreva o simulado em linguagem natural. A IA monta os filtros e sorteia
            questões reais do banco ENEM — vários anos, assuntos específicos, etc.
          </p>

          <label className="block">
            <span className="text-sm text-white/55">O que você quer praticar?</span>
            <textarea
              value={pedidoIa}
              onChange={(e) => setPedidoIa(e.target.value)}
              rows={4}
              placeholder="Ex.: 10 questões de matemática sobre funções, de todos os anos que já caíram no ENEM"
              className="mt-2 w-full resize-none rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
            />
          </label>

          <div className="space-y-2">
            <p className="text-xs text-white/40">Exemplos:</p>
            <div className="flex flex-wrap gap-2">
              {EXEMPLOS_IA.map((exemplo) => (
                <button
                  key={exemplo}
                  type="button"
                  onClick={() => setPedidoIa(exemplo)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55 transition hover:border-white/20 hover:text-white/80"
                >
                  {exemplo}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || pedidoIa.trim().length < 10}
            className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? "IA montando simulado…" : "Gerar simulado com IA"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleManualSubmit}
          className="space-y-6 rounded-[14px] border border-white/[0.06] bg-[#161616] p-8"
        >
          <p className="text-sm text-white/50">
            Filtros avançados: vários anos, busca por assunto no enunciado. Deixe anos
            vazio para misturar todos os anos disponíveis.
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

          <div>
            <span className="text-sm text-white/55">
              Anos{" "}
              <span className="text-white/35">
                (nenhum selecionado = todos os anos)
              </span>
            </span>
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {ANOS_ENEM.map((ano) => {
                const ativo = anosSelecionados.includes(ano);
                return (
                  <button
                    key={ano}
                    type="button"
                    onClick={() => toggleAno(ano)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs transition",
                      ativo
                        ? "bg-white text-black"
                        : "border border-white/10 text-white/55 hover:border-white/20",
                    )}
                  >
                    {ano}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-white/55">
              Assunto no enunciado{" "}
              <span className="text-white/35">(opcional, separar por vírgula)</span>
            </span>
            <input
              type="text"
              value={termosBusca}
              onChange={(e) => setTermosBusca(e.target.value)}
              placeholder="Ex.: função, funções, gráfico"
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
      )}

      {previewIa ? (
        <p className="text-sm text-white/45">{previewIa.resumo}</p>
      ) : null}
    </div>
  );
}

export default function NovoSimuladoPage() {
  return (
    <WorkspaceSection title="Novo simulado">
      <Suspense
        fallback={
          <p className="text-sm text-white/45">Carregando formulário…</p>
        }
      >
        <NovoSimuladoForm />
      </Suspense>
    </WorkspaceSection>
  );
}
