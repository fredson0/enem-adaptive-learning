"use client";

import { TrilhaAreaDetalheView } from "@/components/trilha/trilha-area-detalhe-view";
import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { useTutorSession } from "@/components/workspace/tutor-session-provider";
import {
  fetchTrilha,
  marcarChecklistIa,
  marcarEtapaTrilha,
  type TrilhaArea,
  type TrilhaResponse,
} from "@/lib/trilha";
import { usarTrilhaAtualizada } from "@/lib/trilha-events";
import { recalcularTrilhaProgresso, resolverAssuntoNoCatalogo } from "@/lib/trilha-progresso";
import type { AreaEnemSlug } from "@/lib/simulados";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const AREAS_VALIDAS: AreaEnemSlug[] = [
  "matematica",
  "linguagens",
  "humanas",
  "natureza",
];

function isAreaSlug(value: string): value is AreaEnemSlug {
  return AREAS_VALIDAS.includes(value as AreaEnemSlug);
}

export default function TrilhaAreaPage() {
  const params = useParams<{ area: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { startChatWithSeed } = useTutorSession();
  const [data, setData] = useState<TrilhaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingEtapaId, setTogglingEtapaId] = useState<string | null>(null);
  const [togglingChecklistId, setTogglingChecklistId] = useState<string | null>(
    null,
  );

  const carregarTrilha = useCallback(() => {
    return fetchTrilha().then((response) => {
      if (!response.diagnosticoCompleto) {
        router.replace("/trilha/diagnostico");
        return null;
      }
      setData(response);
      return response;
    });
  }, [router]);

  const slugParam = params.area ?? "";
  const assuntoIdParam = searchParams.get("assuntoId");
  const disciplinaParam = searchParams.get("disciplina");
  const modalidadeParam = searchParams.get("modalidade");

  useEffect(() => {
    if (!isAreaSlug(slugParam)) {
      router.replace("/trilha");
      return;
    }

    carregarTrilha()
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar esta trilha.",
        ),
      )
      .finally(() => setLoading(false));
  }, [carregarTrilha, router, slugParam]);

  useEffect(() => {
    return usarTrilhaAtualizada(() => {
      carregarTrilha().catch(() => undefined);
    });
  }, [carregarTrilha]);

  const abrirTutor = (pergunta: string) => {
    startChatWithSeed([{ role: "user", texto: pergunta }]);
  };

  const atualizarProgressoArea = useCallback(
    (etapaId: string, concluida: boolean) => {
      setData((prev) => {
        if (!prev) return prev;

        const next = {
          ...prev,
          areas: prev.areas.map((item) => {
            if (item.slug !== slugParam) return item;

            const etapas = item.etapas.map((etapa) =>
              etapa.id === etapaId ? { ...etapa, concluida } : etapa,
            );

            return { ...item, etapas };
          }),
        };

        return recalcularTrilhaProgresso(next);
      });
    },
    [slugParam],
  );

  const handleToggleEtapa = async (etapaId: string, concluida: boolean) => {
    const areaAtual = data?.areas.find((item) => item.slug === slugParam);
    const etapaAnterior = areaAtual?.etapas.find((e) => e.id === etapaId);

    setTogglingEtapaId(etapaId);
    atualizarProgressoArea(etapaId, concluida);

    try {
      await marcarEtapaTrilha(etapaId, concluida);
    } catch (err) {
      if (etapaAnterior) {
        atualizarProgressoArea(etapaId, etapaAnterior.concluida);
      }
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar esta etapa.",
      );
    } finally {
      setTogglingEtapaId(null);
    }
  };

  const handleToggleChecklist = async (itemId: string, concluida: boolean) => {
    const itemAnterior = data?.checklistIa.find((item) => item.id === itemId);

    setTogglingChecklistId(itemId);
    setData((prev) => {
      if (!prev) return prev;
      return recalcularTrilhaProgresso({
        ...prev,
        checklistIa: prev.checklistIa.map((item) =>
          item.id === itemId ? { ...item, concluida } : item,
        ),
      });
    });

    try {
      await marcarChecklistIa(itemId, concluida);
    } catch (err) {
      if (itemAnterior) {
        setData((prev) => {
          if (!prev) return prev;
          return recalcularTrilhaProgresso({
            ...prev,
            checklistIa: prev.checklistIa.map((item) =>
              item.id === itemId
                ? { ...item, concluida: itemAnterior.concluida }
                : item,
            ),
          });
        });
      }
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o checklist.",
      );
    } finally {
      setTogglingChecklistId(null);
    }
  };

  if (loading) {
    return (
      <WorkspaceSection>
        <p className="text-sm text-white/45">Abrindo sua trilha…</p>
      </WorkspaceSection>
    );
  }

  if (error || !data) {
    return (
      <WorkspaceSection>
        <p className="text-sm text-red-400">{error ?? "Trilha indisponível"}</p>
      </WorkspaceSection>
    );
  }

  const area: TrilhaArea | undefined = data.areas.find(
    (item) => item.slug === slugParam,
  );

  if (!area) {
    return (
      <WorkspaceSection>
        <p className="text-sm text-white/45">Área não encontrada na sua trilha.</p>
        <Link href="/trilha/geral" className="mt-4 inline-block text-sm text-[#b0ff57]">
          Ver todas as áreas
        </Link>
      </WorkspaceSection>
    );
  }

  const isPrioridade = data.areaPrioritaria === area.slug;
  const assuntoFoco = resolverAssuntoNoCatalogo({
    areaSlug: area.slug,
    assuntoId: assuntoIdParam,
    disciplina: disciplinaParam,
    modalidadeId: modalidadeParam,
  });
  const breadcrumbModalidade = modalidadeParam
    ? `/trilha/geral?modalidade=${encodeURIComponent(modalidadeParam)}`
    : "/trilha/geral";

  return (
    <WorkspaceSection>
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-8">
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap trilha-breadcrumbs sm:flex-wrap sm:gap-3 sm:text-sm sm:whitespace-normal">
          <Link
            href="/trilha"
            className="inline-flex items-center gap-2 text-white/45 transition hover:text-white/75"
          >
            <ArrowLeft className="size-4" />
            Trilha
          </Link>
          <span className="text-white/20">/</span>
          <Link
            href={breadcrumbModalidade}
            className="text-white/45 transition hover:text-white/75"
          >
            {modalidadeParam ? "Modalidade" : "Todas as áreas"}
          </Link>
          <span className="text-white/20">/</span>
          {assuntoFoco ? (
            <>
              <Link
                href={`/trilha/${area.slug}`}
                className="text-white/45 transition hover:text-white/75"
              >
                {area.label}
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-white/70">{assuntoFoco.nome}</span>
            </>
          ) : (
            <span className="text-white/70">{area.label}</span>
          )}
        </div>

        <TrilhaAreaDetalheView
          area={area}
          trilha={data}
          isPrioridade={isPrioridade}
          assuntoFoco={assuntoFoco}
          modalidadeId={modalidadeParam ?? assuntoFoco?.modalidadeId ?? null}
          onAbrirTutor={abrirTutor}
          onToggleEtapa={handleToggleEtapa}
          onToggleChecklist={handleToggleChecklist}
          onTrilhaAtualizada={(trilha) => setData(recalcularTrilhaProgresso(trilha))}
          togglingEtapaId={togglingEtapaId}
          togglingChecklistId={togglingChecklistId}
        />
      </div>
    </WorkspaceSection>
  );
}
