"use client";

import { TrilhaAssuntoCard } from "@/components/trilha/trilha-disciplina-card";
import { TrilhaModalidadeCard } from "@/components/trilha/trilha-modalidade-card";
import type { TrilhaResponse } from "@/lib/trilha";
import {
  agruparModalidadesPorArea,
  filtrarAssuntosModalidade,
  filtrarModalidades,
  getModalidadeById,
  TRILHA_MODALIDADES,
} from "@/lib/trilha-catalogo";
import { calcularProgressoPorAssunto } from "@/lib/trilha-progresso";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

type TrilhaGeralVaultProps = {
  trilha: TrilhaResponse;
};

export function TrilhaGeralVault({ trilha }: TrilhaGeralVaultProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalidadeId = searchParams.get("modalidade");
  const modalidadeAtiva = modalidadeId
    ? getModalidadeById(modalidadeId)
    : undefined;

  const [busca, setBusca] = useState("");

  useEffect(() => {
    setBusca("");
  }, [modalidadeId]);

  const progressoPorAssunto = useMemo(
    () => trilha.progressoPorAssunto ?? calcularProgressoPorAssunto(trilha),
    [trilha],
  );

  const mapaArea = useMemo(
    () => new Map(trilha.areas.map((area) => [area.slug, area])),
    [trilha.areas],
  );

  const assuntosEmFoco = useMemo(() => {
    const foco = new Set<string>();
    for (const area of trilha.areas) {
      for (const disciplina of area.disciplinasSugeridas) {
        foco.add(disciplina.toLowerCase());
      }
    }
    return foco;
  }, [trilha.areas]);

  const areaPrioritaria = trilha.areaPrioritaria;

  const modalidadesFiltradas = useMemo(
    () => filtrarModalidades(busca),
    [busca],
  );

  const gruposModalidades = useMemo(
    () => agruparModalidadesPorArea(modalidadesFiltradas),
    [modalidadesFiltradas],
  );

  const assuntosFiltrados = useMemo(() => {
    if (!modalidadeAtiva) return [];
    return filtrarAssuntosModalidade(modalidadeAtiva.id, busca);
  }, [busca, modalidadeAtiva]);

  const voltar = () => {
    if (modalidadeAtiva) {
      router.push("/trilha/geral");
      setBusca("");
      return;
    }
    router.push("/trilha");
  };

  if (modalidadeId && !modalidadeAtiva) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-6 sm:space-y-8">
        <Link
          href="/trilha/geral"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white/75"
        >
          <ArrowLeft className="size-4" />
          Todas as modalidades
        </Link>
        <p className="text-sm text-white/45">Modalidade não encontrada.</p>
      </div>
    );
  }

  if (modalidadeAtiva) {
    const area = mapaArea.get(modalidadeAtiva.areaSlug);

    return (
      <div className="mx-auto max-w-6xl space-y-8 pb-6 sm:space-y-12 sm:pb-8">
        <button
          type="button"
          onClick={voltar}
          className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white/75"
        >
          <ArrowLeft className="size-4" />
          Todas as modalidades
        </button>

        <header className="mx-auto max-w-2xl space-y-5 text-center sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <p
              className="text-[10px] uppercase tracking-[0.18em] sm:text-[11px]"
              style={{ color: modalidadeAtiva.areaCor }}
            >
              {modalidadeAtiva.areaTag}
            </p>
            <h1 className="text-2xl font-medium tracking-tight text-white sm:text-3xl md:text-5xl">
              {modalidadeAtiva.nome}
            </h1>
            <p className="text-xs text-white/40 sm:text-sm md:text-base">
              {modalidadeAtiva.assuntos.length} assuntos — escolha por onde
              começar.
            </p>
            {area ? (
              <p className="text-xs text-white/30">
                {area.progresso}% da trilha · {area.prioridade}
              </p>
            ) : null}
          </div>

          <div className="relative mx-auto max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30 sm:left-5"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar assunto…"
              className={cn(
                "w-full rounded-full border border-white/[0.08] bg-[#1a1a1a] py-3 pr-4 pl-11 text-sm text-white sm:py-3.5 sm:pr-5 sm:pl-12",
                "placeholder:text-white/30 outline-none transition",
                "focus:border-white/20 focus:bg-[#1e1e1e]",
              )}
            />
          </div>

          {busca.trim() ? (
            <p className="text-xs text-white/35">
              {assuntosFiltrados.length === 0
                ? "Nenhum assunto encontrado."
                : `${assuntosFiltrados.length} resultado${assuntosFiltrados.length === 1 ? "" : "s"}`}
            </p>
          ) : null}
        </header>

        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5">
          {assuntosFiltrados.map((assunto) => (
            <TrilhaAssuntoCard
              key={assunto.id}
              assunto={assunto}
              emFoco={assuntosEmFoco.has(assunto.nome.toLowerCase())}
              progresso={progressoPorAssunto[assunto.id] ?? 0}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-8">
      <Link
        href="/trilha"
        className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white/75"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <header className="mx-auto max-w-2xl space-y-5 text-center sm:space-y-8">
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl font-medium tracking-tight text-white sm:text-3xl md:text-5xl">
            Todas as modalidades
          </h1>
          <p className="text-xs text-white/40 sm:text-sm md:text-base">
            {TRILHA_MODALIDADES.length} modalidades do ENEM — escolha uma para
            ver os assuntos.
          </p>
        </div>

        <div className="relative mx-auto max-w-xl">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-white/30"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar modalidade…"
            className={cn(
              "w-full rounded-full border border-white/[0.08] bg-[#1a1a1a] py-3 pr-4 pl-11 text-sm text-white sm:py-3.5 sm:pr-5 sm:pl-12",
              "placeholder:text-white/30 outline-none transition",
              "focus:border-white/20 focus:bg-[#1e1e1e]",
            )}
          />
        </div>

        {busca.trim() ? (
          <p className="text-xs text-white/35">
            {modalidadesFiltradas.length === 0
              ? "Nenhuma modalidade encontrada."
              : `${modalidadesFiltradas.length} resultado${modalidadesFiltradas.length === 1 ? "" : "s"}`}
          </p>
        ) : null}
      </header>

      <div className="space-y-8 sm:space-y-14">
        {gruposModalidades.map((grupo) => {
          const area = mapaArea.get(grupo.areaSlug);

          return (
            <section key={grupo.areaSlug} className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-3 sm:gap-3 sm:pb-4">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.18em] sm:text-[11px]"
                    style={{ color: grupo.cor }}
                  >
                    {grupo.tag}
                  </p>
                  <h2 className="mt-0.5 text-lg font-medium text-white sm:mt-1 sm:text-xl md:text-2xl">
                    {grupo.label}
                  </h2>
                </div>
                {area ? (
                  <p className="text-xs text-white/35">
                    {area.progresso}% da trilha · {area.prioridade}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5">
                {grupo.itens.map((modalidade) => (
                  <TrilhaModalidadeCard
                    key={modalidade.id}
                    modalidade={modalidade}
                    isPrioridadeArea={areaPrioritaria === modalidade.areaSlug}
                    emFoco={
                      areaPrioritaria === modalidade.areaSlug &&
                      (area?.disciplinasSugeridas.length ?? 0) > 0
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
