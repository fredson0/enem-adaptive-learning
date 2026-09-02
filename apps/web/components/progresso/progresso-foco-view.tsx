"use client";

import { ProgressoAssuntosFracos } from "@/components/progresso/progresso-assuntos-fracos";
import { ProgressoBlock } from "@/components/progresso/progresso-block";
import { ProgressoCoberturaAreas } from "@/components/progresso/progresso-cobertura-areas";
import { ProgressoEnemAnos } from "@/components/progresso/progresso-enem-anos";
import { ProgressoKpiStrip } from "@/components/progresso/progresso-kpi-strip";
import { ProgressoLacunasLista } from "@/components/progresso/progresso-lacunas-lista";
import { ProgressoSectionShell } from "@/components/progresso/progresso-section-shell";
import { ProgressoTrilhaResumo } from "@/components/progresso/progresso-trilha-resumo";
import type { ProgressoDataProps } from "@/components/progresso/progresso-view";
import { AREA_CORES, AREA_SIGLAS, obterProximaAcaoTrilha } from "@/lib/progresso-helpers";
import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";

export function ProgressoFocoView({
  lacunas,
  trilha,
  cobertura,
  onTrilhaAtualizada,
}: ProgressoDataProps & {
  onTrilhaAtualizada?: (trilha: import("@/lib/trilha").TrilhaResponse) => void;
}) {
  const { startChatWithSeed } = useTutorSession();
  const [abrindoTutor, setAbrindoTutor] = useState(false);

  const lacunaPrincipal = lacunas.lacunas[0] ?? null;
  const proximaTrilha = obterProximaAcaoTrilha(trilha);
  const anosCompletos = cobertura?.anos.filter((a) => a.completo).length ?? 0;
  const totalAnos = cobertura?.anos.length ?? 0;
  const assuntosFracos =
    cobertura?.assuntos.filter((a) => a.percentual < 50).length ?? 0;
  const corLacuna = lacunaPrincipal
    ? (AREA_CORES[lacunaPrincipal.slug] ?? "var(--osmo-accent)")
    : "var(--osmo-accent)";

  const hrefSimuladoFocado = lacunaPrincipal
    ? `/simulados/treino/novo?area=${lacunaPrincipal.simuladoSugerido.area}&quantidade=${lacunaPrincipal.simuladoSugerido.quantidade}`
    : "/simulados/treino/novo?quantidade=5";

  const labelTreino = lacunaPrincipal
    ? `Treino em ${lacunaPrincipal.label} · ${lacunaPrincipal.simuladoSugerido.quantidade} questões`
    : "Treino guiado · 5 questões";

  const abrirTutorLacuna = async () => {
    if (!lacunaPrincipal || abrindoTutor) return;

    setAbrindoTutor(true);
    try {
      await startChatWithSeed([
        { role: "user", texto: lacunaPrincipal.perguntaTutor },
      ]);
    } finally {
      setAbrindoTutor(false);
    }
  };

  return (
    <ProgressoSectionShell
      tone="foco"
      title="Foco agora"
      description="Priorize a lacuna mais importante, avance na trilha e cubra provas do ENEM que ainda faltam."
    >
      <section
        className="border-l-2 pl-5 sm:pl-8"
        style={{ borderColor: corLacuna }}
      >
        {lacunaPrincipal ? (
          <p className="text-[11px] uppercase tracking-[0.18em] text-osmo-subtle">
            Próximo passo · {lacunaPrincipal.label} · prioridade{" "}
            {lacunaPrincipal.prioridade}
          </p>
        ) : (
          <p className="text-[11px] uppercase tracking-[0.18em] text-osmo-subtle">
            Próximo passo
          </p>
        )}

        <h3 className="mt-3 max-w-2xl text-2xl font-medium leading-tight tracking-tight text-osmo sm:text-3xl lg:text-4xl">
          {labelTreino}
        </h3>

        {lacunaPrincipal ? (
          <>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-osmo-muted sm:text-base">
              {lacunaPrincipal.mensagem}
            </p>
            <p className="mt-2 text-sm text-osmo-subtle">
              {lacunaPrincipal.acertos}/{lacunaPrincipal.totalQuestoes} acertos
              no banco · score {lacunaPrincipal.score}%
            </p>
          </>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={hrefSimuladoFocado}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-osmo-accent px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
          >
            Começar treino
            <ArrowRight className="size-4" />
          </Link>

          {lacunaPrincipal ? (
            <button
              type="button"
              onClick={abrirTutorLacuna}
              disabled={abrindoTutor}
              className="inline-flex items-center justify-center gap-2 text-sm text-osmo-muted transition hover:text-osmo disabled:opacity-60"
            >
              <MessageSquare className="size-4" />
              {abrindoTutor ? "Abrindo…" : "Perguntar ao tutor"}
            </button>
          ) : null}

          {proximaTrilha ? (
            <Link
              href={proximaTrilha.href}
              className="inline-flex min-w-0 items-center gap-1 text-sm text-osmo-subtle transition hover:text-osmo"
            >
              {proximaTrilha.titulo}
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link
              href="/trilha"
              className="inline-flex min-w-0 items-center gap-1 text-sm text-osmo-subtle transition hover:text-osmo"
            >
              Continuar trilha
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </section>

      <ProgressoKpiStrip
        items={[
          {
            label: "Lacuna #1",
            value: lacunaPrincipal
              ? (AREA_SIGLAS[lacunaPrincipal.slug] ?? lacunaPrincipal.label)
              : "—",
            hint: lacunaPrincipal
              ? `${lacunaPrincipal.label} · ${lacunaPrincipal.score}% de acerto`
              : "Sem prioridade",
            accent: "warning",
          },
          {
            label: "Assuntos fracos",
            value: String(assuntosFracos),
            hint: "abaixo de 50%",
          },
          {
            label: "Provas ENEM",
            value: totalAnos > 0 ? `${anosCompletos}/${totalAnos}` : "—",
            hint: "anos com 100%",
            accent:
              anosCompletos === totalAnos && totalAnos > 0
                ? "positive"
                : "default",
          },
          {
            label: "Lacunas",
            value: String(lacunas.lacunas.length),
            hint: "áreas priorizadas",
          },
        ]}
      />

      <ProgressoBlock
        eyebrow="Todas as lacunas"
        className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
      >
        <ProgressoLacunasLista
          lacunas={lacunas.lacunas}
          destacarPrincipal={false}
        />
      </ProgressoBlock>

      <ProgressoBlock
        eyebrow="Trilha personalizada"
        className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
      >
        <ProgressoTrilhaResumo
          trilha={trilha}
          onTrilhaAtualizada={onTrilhaAtualizada}
        />
      </ProgressoBlock>

      {cobertura?.assuntos?.length || cobertura?.areas?.length ? (
        <div className="grid gap-10 border-t border-[var(--osmo-border)] pt-10 lg:grid-cols-2 lg:gap-16 lg:pt-12">
          {cobertura?.assuntos?.length ? (
            <ProgressoBlock eyebrow="Assuntos para revisar">
              <p className="mb-4 text-sm text-osmo-muted">
                Tópicos com menor domínio no banco de questões.
              </p>
              <ProgressoAssuntosFracos assuntos={cobertura.assuntos} />
            </ProgressoBlock>
          ) : null}

          {cobertura?.areas?.length ? (
            <ProgressoBlock eyebrow="Cobertura por área">
              <ProgressoCoberturaAreas areas={cobertura.areas} />
            </ProgressoBlock>
          ) : null}
        </div>
      ) : null}

      {cobertura?.anos?.length ? (
        <ProgressoBlock
          eyebrow="Provas ENEM por ano"
          className="border-t border-[var(--osmo-border)] pt-10 lg:pt-12"
          action={
            <Link
              href="/simulados/treino/novo?priorizar=1"
              className="inline-flex items-center gap-1 text-xs text-osmo-subtle transition hover:text-osmo"
            >
              Questões novas
              <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <p className="mb-5 text-sm text-osmo-muted">
            Toque em um ano para treinar questões que ainda faltam.
          </p>
          <ProgressoEnemAnos anos={cobertura.anos} />
        </ProgressoBlock>
      ) : null}
    </ProgressoSectionShell>
  );
}
