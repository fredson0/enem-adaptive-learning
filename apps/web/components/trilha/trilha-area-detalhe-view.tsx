"use client";

import { ProgressoCard } from "@/components/progresso/progresso-card";
import { TrilhaAreaSidebar } from "@/components/trilha/trilha-area-sidebar";
import { TrilhaEtapasProgressBar } from "@/components/trilha/trilha-etapas-progress-bar";
import type { TrilhaArea, TrilhaEtapa, TrilhaResponse } from "@/lib/trilha";
import { formatarAssuntos } from "@/lib/trilha";
import {
  adaptarAreaParaAssunto,
  getChecklistArea,
  getMetaAreaContextual,
  getCoberturaAssunto,
  getProgressoAssunto,
} from "@/lib/trilha-progresso";
import type { TrilhaAssuntoCatalogo } from "@/lib/trilha-catalogo";
import { getContextoEstudoAssunto } from "@/lib/trilha-catalogo";
import {
  TrilhaPersonalizarBotao,
  TrilhaPersonalizarPainel,
} from "@/components/trilha/trilha-personalizar-ia-chat";
import { useTrilhaPersonalizarChat } from "@/components/trilha/use-trilha-personalizar-chat";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Map,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

const AREA_GRADIENTS: Record<string, string> = {
  matematica: "from-[#1a2a4a]/80 via-[#161616] to-[#111]",
  linguagens: "from-[#3a1a2a]/80 via-[#161616] to-[#111]",
  humanas: "from-[#3a2a10]/80 via-[#161616] to-[#111]",
  natureza: "from-[#103a2a]/80 via-[#161616] to-[#111]",
};

type TrilhaAreaDetalheViewProps = {
  area: TrilhaArea;
  trilha: TrilhaResponse;
  isPrioridade: boolean;
  assuntoFoco?: TrilhaAssuntoCatalogo;
  modalidadeId?: string | null;
  onAbrirTutor: (pergunta: string) => void;
  onToggleEtapa: (etapaId: string, concluida: boolean) => Promise<void>;
  onToggleChecklist?: (itemId: string, concluida: boolean) => Promise<void>;
  onTrilhaAtualizada?: (trilha: TrilhaResponse) => void;
  togglingEtapaId?: string | null;
  togglingChecklistId?: string | null;
};

function OrientacaoPainel({ disciplinas }: { disciplinas: string[] }) {
  const assuntos =
    disciplinas.length > 0
      ? disciplinas
      : ["os tópicos mais cobrados no ENEM"];

  return (
    <div className="mt-3 space-y-2.5 rounded-[12px] border border-white/[0.08] bg-black/25 p-3 sm:mt-4 sm:space-y-4 sm:rounded-[14px] sm:p-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
          Assuntos prioritários
        </p>
        <ul className="mt-2 space-y-1.5">
          {assuntos.map((disciplina) => (
            <li
              key={disciplina}
              className="flex items-start gap-2 text-sm text-white/70"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#b0ff57]" />
              {disciplina}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
          Ordem sugerida
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Comece lendo esta orientação, depois faça o treino guiado (5 questões),
          o simulado da área (10 questões) e revise os erros com o tutor. Cada
          etapa prepara você para a próxima.
        </p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
          Dica
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Marque cada etapa como concluída quando terminar — você pode voltar e
          repassar qualquer conteúdo a qualquer momento.
        </p>
      </div>
    </div>
  );
}

function EtapaAcoes({
  etapa,
  area,
  onAbrirTutor,
  onToggleEtapa,
  toggling,
  orientacaoAberta,
  onToggleOrientacao,
  disciplinasOrientacao,
}: {
  etapa: TrilhaEtapa;
  area: TrilhaArea;
  onAbrirTutor: (pergunta: string) => void;
  onToggleEtapa: (etapaId: string, concluida: boolean) => Promise<void>;
  toggling: boolean;
  orientacaoAberta: boolean;
  onToggleOrientacao: () => void;
  disciplinasOrientacao: string[];
}) {
  const repassando = etapa.concluida;

  if (etapa.tipo === "orientacao") {
    return (
      <div className="mt-3 space-y-3">
        <button
          type="button"
          onClick={onToggleOrientacao}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs text-white/75 transition hover:border-white/25 hover:bg-white/[0.08] sm:w-auto"
        >
          {orientacaoAberta
            ? "Ocultar orientação"
            : repassando
              ? "Repasar orientação"
              : "Ver orientação"}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              orientacaoAberta && "rotate-180",
            )}
          />
        </button>
        {orientacaoAberta ? (
          <OrientacaoPainel disciplinas={disciplinasOrientacao} />
        ) : null}
        {!etapa.concluida ? (
          <button
            type="button"
            disabled={toggling}
            onClick={() => onToggleEtapa(etapa.id, true)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#b0ff57] px-4 py-2 text-xs font-medium text-black transition hover:bg-[#c4ff7a] disabled:opacity-50 sm:w-auto"
          >
            {toggling ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Marcar como lido
          </button>
        ) : null}
      </div>
    );
  }

  if (etapa.tipo === "tutor") {
    return (
      <button
        type="button"
        onClick={() => onAbrirTutor(area.perguntaTutor)}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#b0ff57] px-4 py-2 text-xs font-medium text-black transition hover:bg-[#c4ff7a] sm:w-auto"
      >
        {repassando ? "Repasar com tutor" : "Abrir tutor IA"}
        <ChevronRight className="size-3.5" />
      </button>
    );
  }

  if (etapa.href) {
    return (
      <Link
        href={etapa.href}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/85 transition hover:border-[#b0ff57]/30 hover:bg-[#b0ff57]/10 hover:text-white sm:w-auto"
      >
        {repassando ? "Repasar etapa" : "Iniciar etapa"}
        <ChevronRight className="size-3.5" />
      </Link>
    );
  }

  return null;
}

export function TrilhaAreaDetalheView({
  area,
  trilha,
  isPrioridade,
  assuntoFoco,
  modalidadeId = null,
  onAbrirTutor,
  onToggleEtapa,
  onToggleChecklist,
  onTrilhaAtualizada,
  togglingEtapaId = null,
  togglingChecklistId = null,
}: TrilhaAreaDetalheViewProps) {
  const areaContextual = assuntoFoco
    ? adaptarAreaParaAssunto(area, assuntoFoco)
    : area;
  const contextoEstudo = assuntoFoco
    ? getContextoEstudoAssunto(assuntoFoco)
    : area.label;
  const proximaEtapa = areaContextual.etapas.find((etapa) => !etapa.concluida);
  const etapasConcluidas = areaContextual.etapas.filter(
    (e) => e.concluida,
  ).length;
  const checklistArea = getChecklistArea(trilha, area, assuntoFoco?.id);
  const checklistConcluidos = checklistArea.filter((item) => item.concluida)
    .length;
  const progressoExibido = assuntoFoco
    ? getProgressoAssunto(trilha, assuntoFoco.id)
    : area.progresso;
  const coberturaAssunto = assuntoFoco
    ? getCoberturaAssunto(trilha, assuntoFoco.id)
    : undefined;
  const assuntos = formatarAssuntos(areaContextual.disciplinasSugeridas);
  const metaArea = getMetaAreaContextual(
    trilha,
    areaContextual,
    assuntoFoco,
    isPrioridade,
  );
  const [orientacaoAbertaId, setOrientacaoAbertaId] = useState<string | null>(
    () =>
      areaContextual.etapas.find((e) => e.tipo === "orientacao" && !e.concluida)
        ?.id ?? null,
  );

  const toggleOrientacao = (etapaId: string) => {
    setOrientacaoAbertaId((atual) => (atual === etapaId ? null : etapaId));
  };

  const chat = useTrilhaPersonalizarChat({
    areaSlug: area.slug,
    assuntoId: assuntoFoco?.id,
    assuntoNome: assuntoFoco?.nome,
    onAtualizado: onTrilhaAtualizada,
  });

  return (
    <LayoutGroup>
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {chat.aberto ? (
            <TrilhaPersonalizarPainel
              key="painel"
              chat={chat}
              titulo="Monte sua checklist"
              subtitulo={
                assuntoFoco
                  ? `${assuntoFoco.nome} · ${contextoEstudo}`
                  : area.label
              }
            />
          ) : (
            <motion.article
              key="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "osmo-surface-dark overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br p-4 sm:rounded-[20px] sm:p-6",
                AREA_GRADIENTS[area.slug] ?? "from-[#161616] to-[#111]",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {isPrioridade ? "Trilha prioritária" : "Plano da área"}
                  </p>
                  <h1 className="mt-1.5 text-xl font-medium tracking-tight text-white sm:mt-2 sm:text-2xl md:text-3xl">
                    {assuntoFoco ? assuntoFoco.nome : area.label}
                  </h1>
                  <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/45 sm:mt-2 sm:text-sm">
                    {assuntoFoco
                      ? `Plano de estudos em ${assuntoFoco.nome} · ${contextoEstudo}.`
                      : area.disciplinasSugeridas.length > 0
                        ? `Foco em ${assuntos}.`
                        : "Siga as etapas para fortalecer esta área."}
                  </p>
                  {assuntoFoco && modalidadeId ? (
                    <Link
                      href={`/trilha/geral?modalidade=${encodeURIComponent(modalidadeId)}`}
                      className="mt-3 inline-block text-xs text-osmo-accent transition hover:opacity-80"
                    >
                      Ver todos os assuntos desta modalidade
                    </Link>
                  ) : null}
                </div>
                <TrilhaPersonalizarBotao
                  chat={chat}
                  variant="ghost"
                  label="Atualizar plano com IA"
                  className="w-full sm:w-auto sm:items-end"
                />
              </div>
            </motion.article>
          )}
        </AnimatePresence>

        <motion.div
          layout
          animate={{
            opacity: chat.aberto ? 0.38 : 1,
            y: chat.aberto ? 28 : 0,
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4 lg:grid-cols-[1fr_300px]"
        >
          <div className="space-y-4">
            <ProgressoCard
              icon={<Map className="size-4" />}
              title="Etapas da trilha"
              bodyClassName="gap-5"
            >
              <TrilhaEtapasProgressBar
                etapas={areaContextual.etapas}
                proximaEtapaId={proximaEtapa?.id}
              />

              <div className="space-y-3">
                {areaContextual.etapas.map((etapa, index) => {
                  const isProxima =
                    etapa.id === proximaEtapa?.id && !etapa.concluida;
                  const toggling = togglingEtapaId === etapa.id;

                  return (
                    <section
                      key={etapa.id}
                      className={cn(
                        "rounded-[14px] border p-3 transition sm:rounded-[16px] sm:p-4",
                        etapa.concluida
                          ? "border-[color-mix(in_srgb,var(--osmo-accent)_15%,transparent)] bg-[color-mix(in_srgb,var(--osmo-accent)_5%,transparent)]"
                          : isProxima
                            ? "border-[color-mix(in_srgb,var(--osmo-accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--osmo-accent)_7%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--osmo-accent)_10%,transparent)]"
                            : "border-[var(--osmo-border)] bg-[var(--osmo-hover)]",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          disabled={toggling}
                          onClick={() =>
                            onToggleEtapa(etapa.id, !etapa.concluida)
                          }
                          title={
                            etapa.concluida
                              ? "Desmarcar etapa"
                              : "Marcar como concluída"
                          }
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition",
                            etapa.concluida
                              ? "bg-[color-mix(in_srgb,var(--osmo-accent)_20%,transparent)] text-osmo-accent hover:bg-[color-mix(in_srgb,var(--osmo-accent)_30%,transparent)]"
                              : isProxima
                                ? "bg-osmo-accent text-[var(--osmo-accent-fg)] hover:opacity-90"
                                : "border border-[var(--osmo-border)] bg-[var(--osmo-card)] text-osmo-subtle hover:border-[color-mix(in_srgb,var(--osmo-text)_15%,transparent)]",
                            toggling && "opacity-50",
                          )}
                        >
                          {toggling ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : etapa.concluida ? (
                            <Check className="size-4" strokeWidth={2} />
                          ) : (
                            <Square className="size-3.5" strokeWidth={2} />
                          )}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-osmo-subtle">
                                Etapa {index + 1}
                                {etapa.concluida ? " · Concluída" : ""}
                              </p>
                              <h2 className="text-sm font-medium text-osmo">
                                {etapa.titulo}
                              </h2>
                            </div>
                            {isProxima ? (
                              <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--osmo-accent)_15%,transparent)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-osmo-accent">
                                Agora
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-osmo-muted">
                            {etapa.descricao}
                          </p>

                          <EtapaAcoes
                            etapa={etapa}
                            area={areaContextual}
                            onAbrirTutor={onAbrirTutor}
                            onToggleEtapa={onToggleEtapa}
                            toggling={toggling}
                            orientacaoAberta={orientacaoAbertaId === etapa.id}
                            onToggleOrientacao={() =>
                              toggleOrientacao(etapa.id)
                            }
                            disciplinasOrientacao={
                              areaContextual.disciplinasSugeridas
                            }
                          />
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </ProgressoCard>
          </div>

          <TrilhaAreaSidebar
            area={area}
            trilha={trilha}
            progressoExibido={progressoExibido}
            etapasConcluidas={etapasConcluidas}
            totalEtapas={areaContextual.etapas.length}
            checklistArea={checklistArea}
            checklistConcluidos={checklistConcluidos}
            metaArea={metaArea}
            assuntoFocoNome={assuntoFoco?.nome}
            coberturaAssunto={coberturaAssunto}
            onToggleChecklist={onToggleChecklist}
            togglingChecklistId={togglingChecklistId}
          />
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
