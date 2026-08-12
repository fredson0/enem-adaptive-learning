"use client";

import type { TrilhaArea, TrilhaEtapa, TrilhaResponse } from "@/lib/trilha";
import { formatarAssuntos } from "@/lib/trilha";
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
  Circle,
  Loader2,
  Sparkles,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

type TrilhaAreaDetalheViewProps = {
  area: TrilhaArea;
  trilha: TrilhaResponse;
  isPrioridade: boolean;
  onAbrirTutor: (pergunta: string) => void;
  onToggleEtapa: (etapaId: string, concluida: boolean) => Promise<void>;
  onToggleChecklist?: (itemId: string, concluida: boolean) => Promise<void>;
  onTrilhaAtualizada?: (trilha: TrilhaResponse) => void;
  togglingEtapaId?: string | null;
  togglingChecklistId?: string | null;
};

function OrientacaoPainel({ area }: { area: TrilhaArea }) {
  const disciplinas =
    area.disciplinasSugeridas.length > 0
      ? area.disciplinasSugeridas
      : ["os tópicos mais cobrados no ENEM"];

  return (
    <div className="mt-4 space-y-4 rounded-[10px] border border-white/[0.08] bg-black/20 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/35">
          Assuntos prioritários
        </p>
        <ul className="mt-2 space-y-1.5">
          {disciplinas.map((disciplina) => (
            <li
              key={disciplina}
              className="flex items-start gap-2 text-sm text-white/70"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#5b4dff]" />
              {disciplina}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/35">
          Ordem sugerida
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Comece lendo esta orientação, depois faça o treino guiado (5 questões),
          o simulado da área (10 questões) e revise os erros com o tutor. Cada
          etapa prepara você para a próxima.
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/35">
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
}: {
  etapa: TrilhaEtapa;
  area: TrilhaArea;
  onAbrirTutor: (pergunta: string) => void;
  onToggleEtapa: (etapaId: string, concluida: boolean) => Promise<void>;
  toggling: boolean;
  orientacaoAberta: boolean;
  onToggleOrientacao: () => void;
}) {
  const repassando = etapa.concluida;

  if (etapa.tipo === "orientacao") {
    return (
      <div className="mt-3 space-y-3">
        <button
          type="button"
          onClick={onToggleOrientacao}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#5b4dff]/30 bg-[#5b4dff]/10 px-4 py-2 text-xs text-[#a89bff] transition hover:bg-[#5b4dff]/15"
        >
          {orientacaoAberta ? "Ocultar orientação" : repassando ? "Repasar orientação" : "Ver orientação"}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              orientacaoAberta && "rotate-180",
            )}
          />
        </button>
        {orientacaoAberta ? <OrientacaoPainel area={area} /> : null}
        {!etapa.concluida ? (
          <button
            type="button"
            disabled={toggling}
            onClick={() => onToggleEtapa(etapa.id, true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-50"
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
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#b0ff57]/30 bg-[#b0ff57]/10 px-4 py-2 text-xs text-[#b0ff57] transition hover:bg-[#b0ff57]/15"
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
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs text-white/80 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
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
  onAbrirTutor,
  onToggleEtapa,
  onToggleChecklist,
  onTrilhaAtualizada,
  togglingEtapaId = null,
  togglingChecklistId = null,
}: TrilhaAreaDetalheViewProps) {
  const proximaEtapa = area.etapas.find((etapa) => !etapa.concluida);
  const etapasConcluidas = area.etapas.filter((e) => e.concluida).length;
  const checklistArea = trilha.checklistIa.filter(
    (item) => !item.areaSlug || item.areaSlug === area.slug,
  );
  const assuntos = formatarAssuntos(area.disciplinasSugeridas);
  const [orientacaoAbertaId, setOrientacaoAbertaId] = useState<string | null>(
    () =>
      area.etapas.find((e) => e.tipo === "orientacao" && !e.concluida)?.id ??
      null,
  );

  const toggleOrientacao = (etapaId: string) => {
    setOrientacaoAbertaId((atual) => (atual === etapaId ? null : etapaId));
  };

  const chat = useTrilhaPersonalizarChat({
    areaSlug: area.slug,
    onAtualizado: onTrilhaAtualizada,
  });

  return (
    <LayoutGroup>
    <div className="space-y-0">
      <AnimatePresence mode="wait">
        {chat.aberto ? (
          <TrilhaPersonalizarPainel
            key="painel"
            chat={chat}
            titulo="Monte sua checklist"
            subtitulo={area.label}
          />
        ) : (
          <motion.header
            key="header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-white/[0.06] pb-8"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#5b4dff]">
              {isPrioridade ? "Trilha prioritária" : "Plano da área"}
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-white md:text-4xl">
              {area.label}
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/40">
              {area.disciplinasSugeridas.length > 0
                ? `Foco em ${assuntos}.`
                : "Siga as etapas para fortalecer esta área."}
            </p>
            <div className="mt-8 flex justify-center">
              <TrilhaPersonalizarBotao
                chat={chat}
                variant="ghost"
                label="Atualizar plano com IA"
              />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <motion.div
        layout
        animate={{
          opacity: chat.aberto ? 0.38 : 1,
          y: chat.aberto ? 28 : 0,
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-10 pt-10 lg:grid-cols-[1fr_300px] lg:gap-14"
      >
      <div className="space-y-8">
        <motion.div layout className="space-y-6">
          {area.etapas.map((etapa, index) => {
            const isProxima = etapa.id === proximaEtapa?.id && !etapa.concluida;
            const toggling = togglingEtapaId === etapa.id;

            return (
              <section
                key={etapa.id}
                className={cn(
                  "rounded-[14px] border p-5 transition",
                  etapa.concluida
                    ? "border-emerald-500/15 bg-emerald-500/5"
                    : isProxima
                      ? "border-[#5b4dff]/30 bg-[#5b4dff]/5"
                      : "border-white/[0.06] bg-[#161616]",
                )}
              >
                <div className="flex items-start gap-4">
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
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : isProxima
                          ? "bg-[#5b4dff] text-white hover:bg-[#6b5fff]"
                          : "bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/70",
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

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white/30">
                          Etapa {index + 1}
                          {etapa.concluida ? " · Concluída" : ""}
                        </p>
                        <h2 className="text-base font-medium text-white">
                          {etapa.titulo}
                        </h2>
                        <p className="mt-1 text-sm text-white/45">
                          {etapa.descricao}
                        </p>
                      </div>
                      {isProxima ? (
                        <span className="shrink-0 rounded-full bg-[#5b4dff]/20 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-[#a89bff]">
                          Agora
                        </span>
                      ) : null}
                    </div>

                    <EtapaAcoes
                      etapa={etapa}
                      area={area}
                      onAbrirTutor={onAbrirTutor}
                      onToggleEtapa={onToggleEtapa}
                      toggling={toggling}
                      orientacaoAberta={orientacaoAbertaId === etapa.id}
                      onToggleOrientacao={() => toggleOrientacao(etapa.id)}
                    />
                  </div>
                </div>
              </section>
            );
          })}
        </motion.div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        {checklistArea.length > 0 ? (
          <div className="rounded-[14px] border border-[#b0ff57]/15 bg-[#b0ff57]/5 p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#b0ff57]/80">
              <Sparkles className="size-3.5" />
              Checklist IA
            </p>
            <ul className="mt-3 space-y-2">
              {checklistArea.map((item) => {
                const toggling = togglingChecklistId === item.id;
                return (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <button
                      type="button"
                      disabled={toggling || !onToggleChecklist}
                      onClick={() =>
                        onToggleChecklist?.(item.id, !item.concluida)
                      }
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition",
                        item.concluida
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "border border-[#b0ff57]/30 text-transparent hover:border-[#b0ff57]/50",
                        toggling && "opacity-50",
                      )}
                    >
                      {toggling ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : item.concluida ? (
                        <Check className="size-3" strokeWidth={2.5} />
                      ) : null}
                    </button>
                    <span
                      className={cn(
                        "text-sm leading-snug",
                        item.concluida
                          ? "text-white/45 line-through"
                          : "text-white/75",
                      )}
                    >
                      {item.texto}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] text-white/35">
              Gerada pela IA com base no seu plano.
            </p>
          </div>
        ) : null}

        <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
          <p className="text-xs uppercase tracking-wide text-white/35">
            Etapas da trilha
          </p>
          <ul className="mt-3 space-y-2">
            {area.etapas.map((etapa) => (
              <li
                key={etapa.id}
                className="flex items-center gap-2.5 text-sm"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    etapa.concluida
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "border border-white/15 text-transparent",
                  )}
                >
                  {etapa.concluida ? (
                    <Check className="size-3" strokeWidth={2.5} />
                  ) : (
                    <span className="size-1.5 rounded-full bg-white/20" />
                  )}
                </span>
                <span
                  className={cn(
                    "truncate",
                    etapa.concluida ? "text-white/50 line-through" : "text-white/75",
                  )}
                >
                  {etapa.titulo}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
          <p className="text-xs uppercase tracking-wide text-white/35">
            Seu status
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Prioridade</dt>
              <dd className="font-medium text-white">{area.prioridade}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Progresso</dt>
              <dd className="font-medium text-white">{area.progresso}%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Proficiência</dt>
              <dd className="font-medium text-white">
                {area.proficienciaReal > 0
                  ? `${area.proficienciaReal}%`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Autoavaliação</dt>
              <dd className="font-medium text-white">{area.autoAvaliacao}/5</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Etapas</dt>
              <dd className="font-medium text-white">
                {etapasConcluidas}/{area.etapas.length}
              </dd>
            </div>
          </dl>
        </div>

        {area.disciplinasSugeridas.length > 0 ? (
          <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
            <p className="text-xs uppercase tracking-wide text-white/35">
              Foco de estudo
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {area.disciplinasSugeridas.map((disciplina) => (
                <span
                  key={disciplina}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60"
                >
                  {disciplina}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {trilha.metaEnem ? (
          <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/35">
              <Sparkles className="size-3.5 text-[#b0ff57]" />
              Objetivo ENEM
            </p>
            <p className="mt-2 text-sm text-white/70">{trilha.metaEnem}</p>
          </div>
        ) : null}

        <div className="rounded-[14px] border border-white/[0.06] bg-[#161616] p-5">
          <p className="text-xs uppercase tracking-wide text-white/35">
            Meta da semana
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            {trilha.metaSemanal}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAbrirTutor(area.perguntaTutor)}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] py-3 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          Pedir plano ao tutor
          <Circle className="size-3 fill-[#b0ff57] text-[#b0ff57]" />
        </button>
      </aside>
      </motion.div>
    </div>
    </LayoutGroup>
  );
}
