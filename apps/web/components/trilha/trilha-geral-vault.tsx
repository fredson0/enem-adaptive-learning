"use client";

import { TrilhaCardsGrid } from "@/components/trilha/trilha-cards-grid";
import {
  TrilhaAssuntoCard,
  TrilhaDisciplinaCard,
} from "@/components/trilha/trilha-disciplina-card";
import { TrilhaModalidadeCard } from "@/components/trilha/trilha-modalidade-card";
import { TrilhaAreasScroll } from "@/components/trilha/trilha-areas-scroll";
import { TrilhaPlanoSemanalCard } from "@/components/trilha/trilha-plano-semanal-card";
import type { TrilhaResponse } from "@/lib/trilha";
import {
  agruparModalidadesPorArea,
  calcularProgressoDisciplina,
  contarAssuntosModalidade,
  filtrarAssuntosModalidade,
  filtrarDisciplinasModalidade,
  filtrarModalidades,
  getDisciplinaById,
  getModalidadeById,
  modalidadeTemDisciplinas,
  TRILHA_MODALIDADES,
  type TrilhaAssuntoCatalogo,
} from "@/lib/trilha-catalogo";
import { calcularProgressoPorAssunto, getCoberturaAssunto } from "@/lib/trilha-progresso";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

type TrilhaGeralVaultProps = {
  trilha: TrilhaResponse;
  onTrilhaAtualizada?: (trilha: TrilhaResponse) => void;
};

function BuscaAssuntos({
  busca,
  onChange,
  placeholder,
  resultadoCount,
}: {
  busca: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultadoCount?: number;
}) {
  return (
    <>
      <div className="relative min-w-0 w-full">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-osmo-subtle sm:left-4"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={busca}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full min-w-0 rounded-full border border-[var(--osmo-border)] bg-[var(--osmo-card)] py-2.5 pr-3 pl-10 text-sm text-osmo sm:py-3 sm:pr-4 sm:pl-11",
            "placeholder:text-osmo-subtle outline-none transition",
            "focus:border-[color-mix(in_srgb,var(--osmo-text)_20%,transparent)] focus:bg-[var(--osmo-hover)]",
          )}
        />
      </div>

      {busca.trim() && resultadoCount !== undefined ? (
        <p className="text-xs text-osmo-subtle">
          {resultadoCount === 0
            ? "Nenhum resultado encontrado."
            : `${resultadoCount} resultado${resultadoCount === 1 ? "" : "s"}`}
        </p>
      ) : null}
    </>
  );
}

function VaultBack({
  onClick,
  href,
  label,
}: {
  onClick?: () => void;
  href?: string;
  label: string;
}) {
  const className =
    "inline-flex min-w-0 max-w-[42%] shrink-0 items-center gap-1.5 text-sm text-osmo-muted transition hover:text-osmo sm:max-w-none";

  const content = (
    <>
      <ArrowLeft className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export function TrilhaGeralVault({
  trilha,
  onTrilhaAtualizada,
}: TrilhaGeralVaultProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalidadeId = searchParams.get("modalidade");
  const disciplinaId = searchParams.get("disciplina");
  const modalidadeAtiva = modalidadeId
    ? getModalidadeById(modalidadeId)
    : undefined;
  const disciplinaAtiva =
    modalidadeId && disciplinaId
      ? getDisciplinaById(modalidadeId, disciplinaId)
      : undefined;

  const [busca, setBusca] = useState("");

  useEffect(() => {
    setBusca("");
  }, [modalidadeId, disciplinaId]);

  const progressoPorAssunto = useMemo(
    () => trilha.progressoPorAssunto ?? calcularProgressoPorAssunto(trilha),
    [trilha],
  );

  const renderAssuntoCard = (assunto: TrilhaAssuntoCatalogo, emFoco: boolean) => {
    const cobertura = getCoberturaAssunto(trilha, assunto.id);
    return (
      <TrilhaAssuntoCard
        key={assunto.id}
        assunto={assunto}
        emFoco={emFoco}
        progresso={progressoPorAssunto[assunto.id] ?? 0}
        dominadas={cobertura?.dominadas}
        disponiveis={cobertura?.disponiveis}
      />
    );
  };

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

  const disciplinasFiltradas = useMemo(() => {
    if (!modalidadeAtiva || !modalidadeTemDisciplinas(modalidadeAtiva)) {
      return [];
    }
    return filtrarDisciplinasModalidade(modalidadeAtiva.id, busca);
  }, [busca, modalidadeAtiva]);

  const assuntosFiltrados = useMemo(() => {
    if (!modalidadeAtiva) return [];
    if (modalidadeTemDisciplinas(modalidadeAtiva) && !disciplinaAtiva) {
      return [];
    }
    return filtrarAssuntosModalidade(
      modalidadeAtiva.id,
      busca,
      disciplinaAtiva?.id,
    );
  }, [busca, disciplinaAtiva, modalidadeAtiva]);

  const voltar = () => {
    if (disciplinaAtiva && modalidadeAtiva) {
      router.push(`/trilha/geral?modalidade=${encodeURIComponent(modalidadeAtiva.id)}`);
      setBusca("");
      return;
    }
    if (modalidadeAtiva) {
      router.push("/trilha/geral");
      setBusca("");
      return;
    }
    router.push("/trilha");
  };

  if (modalidadeId && !modalidadeAtiva) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-6 sm:space-y-8">
        <VaultBack href="/trilha/geral" label="Todas as modalidades" />
        <p className="text-sm text-osmo-muted">Modalidade não encontrada.</p>
      </div>
    );
  }

  if (modalidadeId && disciplinaId && modalidadeAtiva && !disciplinaAtiva) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-6 sm:space-y-8">
        <VaultBack
          href={`/trilha/geral?modalidade=${encodeURIComponent(modalidadeAtiva.id)}`}
          label={modalidadeAtiva.nome}
        />
        <p className="text-sm text-osmo-muted">Matéria não encontrada.</p>
      </div>
    );
  }

  if (disciplinaAtiva && modalidadeAtiva) {
    const area = mapaArea.get(modalidadeAtiva.areaSlug);

    return (
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-6 sm:space-y-10 sm:pb-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <VaultBack onClick={voltar} label={modalidadeAtiva.nome} />
          <div className="min-w-0 flex-1">
            <BuscaAssuntos
              busca={busca}
              onChange={setBusca}
              placeholder="Buscar assunto…"
            />
          </div>
        </div>
        {busca.trim() ? (
          <p className="-mt-3 text-xs text-osmo-subtle">
            {assuntosFiltrados.length === 0
              ? "Nenhum resultado encontrado."
              : `${assuntosFiltrados.length} resultado${assuntosFiltrados.length === 1 ? "" : "s"}`}
          </p>
        ) : null}

        <header className="space-y-2 sm:mx-auto sm:max-w-2xl sm:space-y-3 sm:text-center">
          <p
            className="text-[10px] uppercase tracking-[0.18em] sm:text-[11px]"
            style={{ color: modalidadeAtiva.areaCor }}
          >
            {modalidadeAtiva.nome}
          </p>
          <h1 className="text-2xl font-medium tracking-tight wrap-break-word text-osmo sm:text-3xl md:text-5xl">
            {disciplinaAtiva.nome}
          </h1>
          <p className="text-xs text-osmo-muted sm:text-sm md:text-base">
            {disciplinaAtiva.assuntos.length} assuntos — escolha por onde
            começar.
          </p>
          {area ? (
            <p className="text-xs text-osmo-subtle">
              {area.progresso}% da trilha · {area.prioridade}
            </p>
          ) : null}
        </header>

        <TrilhaCardsGrid>
          {assuntosFiltrados.map((assunto) =>
            renderAssuntoCard(
              assunto,
              assuntosEmFoco.has(assunto.nome.toLowerCase()),
            ),
          )}
        </TrilhaCardsGrid>
      </div>
    );
  }

  if (modalidadeAtiva) {
    const area = mapaArea.get(modalidadeAtiva.areaSlug);
    const temDisciplinas = modalidadeTemDisciplinas(modalidadeAtiva);

    return (
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-6 sm:space-y-10 sm:pb-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <VaultBack onClick={voltar} label="Todas as modalidades" />
          <div className="min-w-0 flex-1">
            <BuscaAssuntos
              busca={busca}
              onChange={setBusca}
              placeholder={temDisciplinas ? "Buscar matéria…" : "Buscar assunto…"}
            />
          </div>
        </div>
        {busca.trim() ? (
          <p className="-mt-3 text-xs text-osmo-subtle">
            {(temDisciplinas ? disciplinasFiltradas.length : assuntosFiltrados.length) === 0
              ? "Nenhum resultado encontrado."
              : `${temDisciplinas ? disciplinasFiltradas.length : assuntosFiltrados.length} resultado${(temDisciplinas ? disciplinasFiltradas.length : assuntosFiltrados.length) === 1 ? "" : "s"}`}
          </p>
        ) : null}

        <header className="space-y-2 sm:mx-auto sm:max-w-2xl sm:space-y-3 sm:text-center">
          <p
            className="text-[10px] uppercase tracking-[0.18em] sm:text-[11px]"
            style={{ color: modalidadeAtiva.areaCor }}
          >
            {modalidadeAtiva.areaTag}
          </p>
          <h1 className="text-2xl font-medium tracking-tight wrap-break-word text-osmo sm:text-3xl md:text-5xl">
            {modalidadeAtiva.nome}
          </h1>
          <p className="text-xs text-osmo-muted sm:text-sm md:text-base">
            {temDisciplinas
              ? `${modalidadeAtiva.disciplinas?.length ?? 0} matérias — escolha por onde começar.`
              : `${contarAssuntosModalidade(modalidadeAtiva)} assuntos — escolha por onde começar.`}
          </p>
          {area ? (
            <p className="text-xs text-osmo-subtle">
              {area.progresso}% da trilha · {area.prioridade}
            </p>
          ) : null}
        </header>

        <TrilhaCardsGrid>
          {temDisciplinas
            ? disciplinasFiltradas.map((disciplina) => (
                <TrilhaDisciplinaCard
                  key={disciplina.id}
                  disciplina={disciplina}
                  emFoco={assuntosEmFoco.has(disciplina.nome.toLowerCase())}
                  progresso={calcularProgressoDisciplina(
                    disciplina,
                    progressoPorAssunto,
                  )}
                />
              ))
            : assuntosFiltrados.map((assunto) =>
                renderAssuntoCard(
                  assunto,
                  assuntosEmFoco.has(assunto.nome.toLowerCase()),
                ),
              )}
        </TrilhaCardsGrid>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-8 sm:space-y-12">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <VaultBack href="/trilha" label="Voltar" />
        <div className="min-w-0 flex-1">
          <BuscaAssuntos
            busca={busca}
            onChange={setBusca}
            placeholder="Buscar modalidade…"
          />
        </div>
      </div>
      {busca.trim() ? (
        <p className="-mt-3 text-xs text-osmo-subtle">
          {modalidadesFiltradas.length === 0
            ? "Nenhum resultado encontrado."
            : `${modalidadesFiltradas.length} resultado${modalidadesFiltradas.length === 1 ? "" : "s"}`}
        </p>
      ) : null}

      <header className="space-y-2 sm:mx-auto sm:max-w-2xl sm:space-y-3 sm:text-center">
        <h1 className="text-2xl font-medium tracking-tight text-osmo sm:text-3xl md:text-5xl">
          Todas as modalidades
        </h1>
        <p className="text-xs text-osmo-muted sm:text-sm md:text-base">
          {TRILHA_MODALIDADES.length} modalidades do ENEM — escolha uma para
          ver os assuntos.
        </p>
      </header>

      <TrilhaPlanoSemanalCard
        trilha={trilha}
        onTrilhaAtualizada={onTrilhaAtualizada}
      />

      {trilha.areas.length > 0 ? (
        <section className="space-y-4">
          <div className="px-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-osmo-subtle">
              Suas áreas
            </p>
            <h2 className="mt-1 text-lg font-medium text-osmo sm:text-xl">
              Prioridade e progresso por modalidade
            </h2>
          </div>
          <TrilhaAreasScroll areas={trilha.areas} />
        </section>
      ) : null}

      <div className="space-y-8 sm:space-y-14">
        {gruposModalidades.map((grupo) => {
          const area = mapaArea.get(grupo.areaSlug);

          return (
            <section key={grupo.areaSlug} className="space-y-4 sm:space-y-5">
              <div className="flex min-w-0 flex-wrap items-end justify-between gap-2 border-b border-[var(--osmo-border)] pb-3 sm:gap-3 sm:pb-4">
                <div className="min-w-0">
                  <p
                    className="text-[10px] uppercase tracking-[0.18em] sm:text-[11px]"
                    style={{ color: grupo.cor }}
                  >
                    {grupo.tag}
                  </p>
                  <h2 className="mt-0.5 text-lg font-medium text-osmo sm:mt-1 sm:text-xl md:text-2xl">
                    {grupo.label}
                  </h2>
                </div>
                {area ? (
                  <p className="text-xs text-osmo-subtle">
                    {area.progresso}% da trilha · {area.prioridade}
                  </p>
                ) : null}
              </div>

              <TrilhaCardsGrid>
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
              </TrilhaCardsGrid>
            </section>
          );
        })}
      </div>
    </div>
  );
}
