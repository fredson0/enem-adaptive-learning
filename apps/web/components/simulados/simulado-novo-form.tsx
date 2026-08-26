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
  const [priorizarNaoDominadas, setPriorizarNaoDominadas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disponiveis, setDisponiveis] = useState<number | null>(null);
  const [contando, setContando] = useState(false);

  useEffect(() => {
    const areaParam = searchParams.get("area");
    const quantidadeParam = searchParams.get("quantidade");
    const assuntoParam = searchParams.get("assunto");
    const anoParam = searchParams.get("ano");
    const priorizarParam = searchParams.get("priorizar");

    if (priorizarParam === "1" || priorizarParam === "true") {
      setPriorizarNaoDominadas(true);
    }

    if (areaParam && AREA_OPTIONS.some((option) => option.value === areaParam)) {
      setArea(areaParam);
    }

    if (quantidadeParam) {
      const parsed = Number(quantidadeParam);
      if (modo.quantidades.includes(parsed)) {
        setQuantidade(parsed);
      }
    }

    if (assuntoParam?.trim()) {
      const assunto = assuntoParam.trim();
      const areaLabel =
        AREA_OPTIONS.find((option) => option.value === (areaParam ?? area))
          ?.label ?? "ENEM";
      setTermosBusca(assunto);
      setPedidoIa(
        `${quantidadeParam ?? modo.quantidades[0]} questões de ${areaLabel.toLowerCase()} sobre ${assunto.toLowerCase()}`,
      );
    }

    if (anoParam) {
      const ano = Number(anoParam);
      if (Number.isFinite(ano)) {
        setAnosSelecionados([ano]);
      }
    }
  }, [searchParams, modo.quantidades, area]);

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
        priorizarNaoDominadas,
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
      <div className="rounded-[14px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] p-5">
        <p className="text-sm font-medium text-osmo">{modo.label}</p>
        <p className="mt-1 text-sm text-osmo-muted">{modo.description}</p>
        {modo.usaCronometro ? (
          <p className="mt-3 text-xs text-amber-200/80">
            Gabarito revelado apenas no resultado · ~4 minutos por questão
          </p>
        ) : null}
      </div>

      {modo.permitePedidoIa ? (
        <div className="flex gap-2 rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-hover)] p-1">
          <button
            type="button"
            onClick={() => setFormModo("ia")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm transition",
              formModo === "ia"
                ? "bg-[var(--osmo-text)] text-[var(--osmo-canvas)]"
                : "text-osmo-muted hover:text-osmo",
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
                ? "bg-[var(--osmo-text)] text-[var(--osmo-canvas)]"
                : "text-osmo-muted hover:text-osmo",
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
          className="space-y-6 rounded-[14px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] p-8"
        >
          <label className="block">
            <span className="text-sm text-osmo-muted">O que você quer praticar?</span>
            <textarea
              value={pedidoIa}
              onChange={(e) => setPedidoIa(e.target.value)}
              rows={4}
              placeholder="Descreva área, quantidade, assuntos e anos..."
              className="mt-2 w-full resize-none rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-4 py-3 text-osmo outline-none focus:border-[color-mix(in_srgb,var(--osmo-text)_20%,transparent)]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {(EXEMPLOS_IA[modo.slug] ?? []).map((exemplo) => (
              <button
                key={exemplo}
                type="button"
                onClick={() => setPedidoIa(exemplo)}
                className="rounded-full border border-[var(--osmo-border)] px-3 py-1 text-xs text-osmo-muted transition hover:border-[color-mix(in_srgb,var(--osmo-text)_15%,transparent)] hover:text-osmo"
              >
                {exemplo}
              </button>
            ))}
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || pedidoIa.trim().length < 10}
            className="w-full rounded-full bg-osmo-accent px-4 py-3 text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "IA montando simulado…" : "Gerar simulado com IA"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleManualSubmit}
          className="space-y-6 rounded-[14px] border border-[var(--osmo-border)] bg-[var(--osmo-card)] p-8"
        >
          {(modo.areaObrigatoria || formModo === "manual") && (
            <label className="block">
              <span className="text-sm text-osmo-muted">
                Área {modo.areaObrigatoria ? "" : "(opcional)"}
              </span>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-2 w-full rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-4 py-3 text-osmo outline-none focus:border-[color-mix(in_srgb,var(--osmo-text)_20%,transparent)]"
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
            <span className="text-sm text-osmo-muted">Quantidade de questões</span>
            <select
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="mt-2 w-full rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-4 py-3 text-osmo outline-none focus:border-[color-mix(in_srgb,var(--osmo-text)_20%,transparent)]"
            >
              {modo.quantidades.map((qtd) => (
                <option key={qtd} value={qtd}>
                  {qtd} questões
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-sm text-osmo-muted">
              Anos{" "}
              <span className="text-osmo-subtle">(vazio = todos)</span>
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
                        ? "bg-[var(--osmo-text)] text-[var(--osmo-canvas)]"
                        : "border border-[var(--osmo-border)] text-osmo-muted hover:border-[color-mix(in_srgb,var(--osmo-text)_15%,transparent)]",
                    )}
                  >
                    {ano}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-osmo-muted">
              Assunto no enunciado{" "}
              <span className="text-osmo-subtle">(opcional)</span>
            </span>
            <input
              type="text"
              value={termosBusca}
              onChange={(e) => setTermosBusca(e.target.value)}
              placeholder="Ex.: função, gráfico, interpretação"
              className="mt-2 w-full rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-4 py-3 text-osmo outline-none focus:border-[color-mix(in_srgb,var(--osmo-text)_20%,transparent)]"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-[var(--osmo-border)] bg-[var(--osmo-hover)] px-4 py-3">
            <input
              type="checkbox"
              checked={priorizarNaoDominadas}
              onChange={(e) => setPriorizarNaoDominadas(e.target.checked)}
              className="mt-0.5 size-4 rounded border-[var(--osmo-border)] bg-transparent accent-[var(--osmo-accent)]"
            />
            <span className="text-sm leading-snug text-osmo-muted">
              Priorizar questões que você ainda não dominou
              <span className="mt-0.5 block text-xs text-osmo-subtle">
                Cada acerto conta uma vez no progresso — repetir não aumenta a cobertura.
              </span>
            </span>
          </label>

          <p className="text-sm text-osmo-subtle">
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
            className="w-full rounded-full bg-osmo-accent px-4 py-3 text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
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
    <Suspense fallback={<p className="text-sm text-osmo-muted">Carregando…</p>}>
      <NovoSimuladoFormInner modoSlug={modoSlug} />
    </Suspense>
  );
}
