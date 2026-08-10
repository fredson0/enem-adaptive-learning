"use client";

import type { ModoSimuladoSlug } from "@/lib/simulado-modos";
import { getModoBySlug } from "@/lib/simulado-modos";
import {
  ANOS_ENEM,
  AREA_OPTIONS,
  contarQuestoes,
  criarSimulado,
  gerarSimuladoComIa,
} from "@/lib/simulados-api";
import { cn } from "@/lib/utils";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type ModoForm = "ia" | "manual";

const EXEMPLOS_IA: Record<string, string[]> = {
  treino: [
    "10 questões de matemática sobre funções, de todos os anos",
    "5 questões de interpretação de texto em linguagens",
  ],
  modalidade: [
    "20 questões de ciências da natureza sobre eletromagnetismo",
    "45 questões de matemática dos anos 2018 a 2022",
  ],
  cronometrado: [],
};

function NovoSimuladoFormInner({ modoSlug }: { modoSlug: ModoSimuladoSlug }) {
  const modo = getModoBySlug(modoSlug)!;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formModo, setFormModo] = useState<ModoForm>(
    modo.permitePedidoIa ? "ia" : "manual",
  );
  const [area, setArea] = useState<string>(AREA_OPTIONS[0].value);
  const [quantidade, setQuantidade] = useState<number>(modo.quantidades[0]);
  const [anosSelecionados, setAnosSelecionados] = useState<number[]>([]);
  const [termosBusca, setTermosBusca] = useState("");
  const [pedidoIa, setPedidoIa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disponiveis, setDisponiveis] = useState<number | null>(null);
  const [contando, setContando] = useState(false);

  useEffect(() => {
    const areaParam = searchParams.get("area");
    const quantidadeParam = searchParams.get("quantidade");

    if (areaParam && AREA_OPTIONS.some((option) => option.value === areaParam)) {
      setArea(areaParam);
    }

    if (quantidadeParam) {
      const parsed = Number(quantidadeParam);
      if (modo.quantidades.includes(parsed)) {
        setQuantidade(parsed);
      }
    }
  }, [searchParams, modo.quantidades]);

  useEffect(() => {
    const termos = termosBusca
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setContando(true);
    const timeout = window.setTimeout(() => {
      contarQuestoes({
        area: modo.areaObrigatoria || area ? area : undefined,
        anos: anosSelecionados.length ? anosSelecionados : undefined,
        termosBusca: termos.length ? termos : undefined,
      })
        .then((response) => setDisponiveis(response.total))
        .catch(() => setDisponiveis(null))
        .finally(() => setContando(false));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [area, anosSelecionados, termosBusca, modo.areaObrigatoria]);

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
      const result = await criarSimulado({
        modo: modo.api,
        area: modo.areaObrigatoria ? area : area || undefined,
        quantidade,
        ...(anosSelecionados.length ? { anos: anosSelecionados } : {}),
        ...(termos.length ? { termosBusca: termos } : {}),
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

    try {
      const result = await gerarSimuladoComIa({
        pedido: pedidoIa,
        modo: modo.api,
      });

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
      <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
        <p className="text-sm font-medium text-white">{modo.label}</p>
        <p className="mt-1 text-sm text-white/50">{modo.description}</p>
        {modo.usaCronometro ? (
          <p className="mt-3 text-xs text-amber-200/80">
            Gabarito revelado apenas no resultado · ~4 minutos por questão
          </p>
        ) : null}
      </div>

      {modo.permitePedidoIa ? (
        <div className="flex gap-2 rounded-full border border-white/10 bg-[#111] p-1">
          <button
            type="button"
            onClick={() => setFormModo("ia")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm transition",
              formModo === "ia"
                ? "bg-white text-black"
                : "text-white/55 hover:text-white",
            )}
          >
            <Sparkles className="size-4" strokeWidth={1.75} />
            Pedir à IA
          </button>
          <button
            type="button"
            onClick={() => setFormModo("manual")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm transition",
              formModo === "manual"
                ? "bg-white text-black"
                : "text-white/55 hover:text-white",
            )}
          >
            <SlidersHorizontal className="size-4" strokeWidth={1.75} />
            Filtros manuais
          </button>
        </div>
      ) : null}

      {formModo === "ia" && modo.permitePedidoIa ? (
        <form
          onSubmit={handleIaSubmit}
          className="space-y-6 rounded-[14px] border border-white/[0.06] bg-[#161616] p-8"
        >
          <label className="block">
            <span className="text-sm text-white/55">O que você quer praticar?</span>
            <textarea
              value={pedidoIa}
              onChange={(e) => setPedidoIa(e.target.value)}
              rows={4}
              placeholder="Descreva área, quantidade, assuntos e anos..."
              className="mt-2 w-full resize-none rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {(EXEMPLOS_IA[modo.slug] ?? []).map((exemplo) => (
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
          {(modo.areaObrigatoria || formModo === "manual") && (
            <label className="block">
              <span className="text-sm text-white/55">
                Área {modo.areaObrigatoria ? "" : "(opcional)"}
              </span>
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
          )}

          <label className="block">
            <span className="text-sm text-white/55">Quantidade de questões</span>
            <select
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
            >
              {modo.quantidades.map((qtd) => (
                <option key={qtd} value={qtd}>
                  {qtd} questões
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-sm text-white/55">
              Anos{" "}
              <span className="text-white/35">(vazio = todos)</span>
            </span>
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto tutor-prompt-scroll">
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
              <span className="text-white/35">(opcional)</span>
            </span>
            <input
              type="text"
              value={termosBusca}
              onChange={(e) => setTermosBusca(e.target.value)}
              placeholder="Ex.: função, gráfico, interpretação"
              className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
            />
          </label>

          <p className="text-sm text-white/45">
            {contando
              ? "Contando questões disponíveis…"
              : disponiveis !== null
                ? `${disponiveis} questão(ões) no banco com esses filtros`
                : "Não foi possível estimar o banco agora"}
          </p>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || (disponiveis !== null && disponiveis < quantidade)}
            className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? "Gerando…" : "Começar simulado"}
          </button>
        </form>
      )}
    </div>
  );
}

export function SimuladoNovoForm({ modoSlug }: { modoSlug: ModoSimuladoSlug }) {
  return (
    <Suspense fallback={<p className="text-sm text-white/45">Carregando…</p>}>
      <NovoSimuladoFormInner modoSlug={modoSlug} />
    </Suspense>
  );
}
