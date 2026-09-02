"use client";

import { ProgressoBlock } from "@/components/progresso/progresso-block";
import { ProgressoKpiStrip } from "@/components/progresso/progresso-kpi-strip";
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
import { AREA_CORES } from "@/lib/progresso-helpers";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

const AREA_TAGS: Record<string, string> = {
  matematica: "Exatas",
  linguagens: "Texto",
  humanas: "Humanas",
  natureza: "Natureza",
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
    <div className="mt-4 space-y-5 border-l-2 border-osmo-accent/40 pl-4 sm:pl-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-osmo-subtle">
          Assuntos prioritários
        </p>
        <ul className="mt-2 space-y-1.5">
          {assuntos.map((disciplina) => (
            <li key={disciplina} className="text-sm leading-relaxed text-osmo-muted">
              {disciplina}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-osmo-subtle">
          Ordem sugerida
        </p>
        <p className="mt-2 text-sm leading-relaxed text-osmo-muted">
          Comece lendo esta orientação, depois faça o treino guiado (5 questões),
          o simulado da área (10 questões) e revise os erros com o tutor. Cada
          etapa prepara você para a próxima.
        </p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-osmo-subtle">
          Dica
        </p>
        <p className="mt-2 text-sm leading-relaxed text-osmo-muted">
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
  destaque = false,
}: {
  etapa: TrilhaEtapa;
  area: TrilhaArea;
  onAbrirTutor: (pergunta: string) => void;
  onToggleEtapa: (etapaId: string, concluida: boolean) => Promise<void>;
  toggling: boolean;
  orientacaoAberta: boolean;
  onToggleOrientacao: () => void;
  disciplinasOrientacao: string[];
  destaque?: boolean;
}) {
  const repassando = etapa.concluida;
  const ctaClass = destaque
    ? "inline-flex items-center gap-1.5 rounded-full bg-osmo-accent px-4 py-2 text-sm font-medium text-[var(--osmo-accent-fg)] transition hover:opacity-90 disabled:opacity-50"
    : "inline-flex items-center gap-1.5 text-sm text-osmo-accent transition hover:underline disabled:opacity-50";

  if (etapa.tipo === "orientacao") {
    return (
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={onToggleOrientacao}
          className="inline-flex items-center gap-1.5 text-sm text-osmo-muted transition hover:text-osmo"
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
            className={ctaClass}
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
      <button type="button" onClick={() => onAbrirTutor(area.perguntaTutor)} className={cn("mt-4", ctaClass)}>
        {repassando ? "Repasar com tutor" : "Abrir tutor IA"}
        <ChevronRight className="size-3.5" />
      </button>
    );
  }

  if (etapa.href) {
    return (
      <Link href={etapa.href} className={cn("mt-4", ctaClass)}>
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
  const lacunasArea = (trilha.lacunasPorDisciplina ?? []).filter(
    (item) => item.slug === area.slug,
  );
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
      <div className="flex min-w-0 flex-col gap-10 sm:gap-12 lg:gap-16">
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
            <motion.header
              key="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 border-b border-[var(--osmo-border)] pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
            >
              <div className="min-w-0">
                <p
                  className="text-[11px] uppercase tracking-[0.2em]"
                  style={{
                    color: AREA_CORES[area.slug] ?? "var(--osmo-accent)",
                  }}
                >
                  {isPrioridade
                    ? "Trilha prioritária"
                    : (AREA_TAGS[area.slug] ?? "Plano da área")}
                </p>
                <h1 className="mt-2 text-[1.75rem] leading-[1.1] font-medium tracking-tight wrap-break-word text-osmo sm:text-4xl lg:text-[2.75rem]">
                  {assuntoFoco ? assuntoFoco.nome : area.label}
                </h1>
              </div>
              <div className="max-w-md lg:pb-1 lg:text-right">
                <p className="text-[13px] leading-relaxed text-osmo-muted sm:text-sm">
                  {assuntoFoco
                    ? `Plano de estudos em ${assuntoFoco.nome} · ${contextoEstudo}.`
                    : area.disciplinasSugeridas.length > 0
                      ? `Foco em ${assuntos}.`
                      : "Siga as etapas para fortalecer esta área."}
                </p>
                {assuntoFoco && modalidadeId ? (
                  <Link
                    href={`/trilha/geral?modalidade=${encodeURIComponent(modalidadeId)}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-osmo-accent transition hover:underline"
                  >
                    Ver todos os assuntos
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : null}
                <div className="mt-3 lg:flex lg:justify-end">
                  <TrilhaPersonalizarBotao
                    chat={chat}
                    variant="text"
                    label="Atualizar plano com IA"
                  />
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <ProgressoKpiStrip
          items={[
            {
              label: "Progresso",
              value: `${progressoExibido}%`,
              hint: coberturaAssunto
                ? `${coberturaAssunto.dominadas}/${coberturaAssunto.disponiveis} dominadas`
                : `${etapasConcluidas}/${areaContextual.etapas.length} etapas`,
              accent: "positive",
            },
            {
              label: "Etapas",
              value: `${etapasConcluidas}/${areaContextual.etapas.length}`,
              hint: proximaEtapa ? `Agora: ${proximaEtapa.titulo}` : "Trilha completa",
            },
            {
              label: "Prioridade",
              value: area.prioridade,
              hint: isPrioridade ? "Área em foco" : "Nesta modalidade",
              accent: area.prioridade === "Alta" ? "warning" : "default",
            },
            {
              label: "Checklist",
              value:
                checklistArea.length > 0
                  ? `${checklistConcluidos}/${checklistArea.length}`
                  : "—",
              hint: "metas desta área",
            },
          ]}
        />

        {lacunasArea.length > 0 ? (
          <ProgressoBlock
            eyebrow="Lacunas por disciplina"
            className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
          >
            <p className="mb-5 text-sm text-osmo-muted">
              Com base nos erros dos seus simulados nesta área.
            </p>
            <ul className="divide-y divide-[var(--osmo-border)]">
              {lacunasArea.slice(0, 4).map((item) => (
                <li
                  key={`${item.slug}-${item.disciplina}`}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-osmo">
                      {item.disciplina}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed wrap-break-word text-osmo-muted">
                      {item.mensagem}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-osmo-accent">
                    {item.erros} erro{item.erros === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </ProgressoBlock>
        ) : null}

        <motion.div
          layout
          animate={{
            opacity: chat.aberto ? 0.38 : 1,
            y: chat.aberto ? 28 : 0,
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 border-t border-[var(--osmo-border)] pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-12"
        >
          <ProgressoBlock eyebrow="Etapas da trilha" className="lg:col-span-7">
            <TrilhaEtapasProgressBar
              etapas={areaContextual.etapas}
              proximaEtapaId={proximaEtapa?.id}
            />

            <ol className="mt-8 divide-y divide-[var(--osmo-border)]">
              {areaContextual.etapas.map((etapa, index) => {
                const isProxima =
                  etapa.id === proximaEtapa?.id && !etapa.concluida;
                const toggling = togglingEtapaId === etapa.id;

                return (
                  <li key={etapa.id} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        disabled={toggling}
                        onClick={() => onToggleEtapa(etapa.id, !etapa.concluida)}
                        title={
                          etapa.concluida
                            ? "Desmarcar etapa"
                            : "Marcar como concluída"
                        }
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums transition",
                          etapa.concluida
                            ? "bg-[color-mix(in_srgb,var(--osmo-accent)_20%,transparent)] text-osmo-accent"
                            : isProxima
                              ? "bg-osmo-accent text-[var(--osmo-accent-fg)]"
                              : "border border-[var(--osmo-border)] text-osmo-subtle",
                          toggling && "opacity-50",
                        )}
                      >
                        {toggling ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : etapa.concluida ? (
                          <Check className="size-4" strokeWidth={2} />
                        ) : (
                          index + 1
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-osmo-subtle">
                          Etapa {index + 1}
                          {etapa.concluida ? " · concluída" : ""}
                          {isProxima ? " · agora" : ""}
                        </p>
                        <h2 className="mt-1 text-lg font-medium leading-snug wrap-break-word text-osmo sm:text-xl">
                          {etapa.titulo}
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed wrap-break-word text-osmo-muted">
                          {etapa.descricao}
                        </p>

                        <EtapaAcoes
                          etapa={etapa}
                          area={areaContextual}
                          onAbrirTutor={onAbrirTutor}
                          onToggleEtapa={onToggleEtapa}
                          toggling={toggling}
                          orientacaoAberta={orientacaoAbertaId === etapa.id}
                          onToggleOrientacao={() => toggleOrientacao(etapa.id)}
                          disciplinasOrientacao={
                            areaContextual.disciplinasSugeridas
                          }
                          destaque={isProxima}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </ProgressoBlock>

          <div className="lg:col-span-5">
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
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
