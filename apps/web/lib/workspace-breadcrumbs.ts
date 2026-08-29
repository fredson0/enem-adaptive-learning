import { getModalidadeById } from "@/lib/trilha-catalogo";
import { getModoBySlug } from "@/lib/simulado-modos";
import {
  PLANOS_NAV,
  PROFILE_NAV,
  SIMULADOS_NAV,
  TUTOR_NAV,
  WORKSPACE_NAV,
} from "@/lib/workspace-nav";

export type WorkspaceCrumb = {
  label: string;
  href?: string;
};

const TRILHA_NAV = WORKSPACE_NAV.find((item) => item.href === "/trilha")!;
const PROGRESSO_NAV = WORKSPACE_NAV.find((item) => item.href === "/progresso")!;

const TRILHA_AREA_LABELS: Record<string, string> = {
  matematica: "Matemática",
  linguagens: "Linguagens",
  humanas: "Ciências Humanas",
  natureza: "Ciências da Natureza",
};

const SIMULADO_SEGMENTOS_RESERVADOS = new Set([
  "treino",
  "modalidade",
  "cronometrado",
  "novo",
]);

function tutorCrumbs(
  pathname: string,
  activeSessionTitle: string | null,
): WorkspaceCrumb[] {
  const base: WorkspaceCrumb = {
    label: TUTOR_NAV.label,
    href: TUTOR_NAV.href,
  };

  if (activeSessionTitle) {
    return [base, { label: activeSessionTitle }];
  }

  if (/^\/tutor\/[^/]+$/.test(pathname)) {
    return [base, { label: "Conversa" }];
  }

  return [{ label: TUTOR_NAV.label }];
}

function simuladosCrumbs(pathname: string): WorkspaceCrumb[] {
  const base: WorkspaceCrumb = {
    label: SIMULADOS_NAV.label,
    href: SIMULADOS_NAV.href,
  };

  if (pathname === SIMULADOS_NAV.href) {
    return [{ label: SIMULADOS_NAV.label }];
  }

  const segments = pathname.split("/").filter(Boolean).slice(1);
  const [first, second] = segments;

  if (!first) {
    return [{ label: SIMULADOS_NAV.label }];
  }

  if (first === "novo") {
    return [base, { label: "Novo" }];
  }

  const modo = getModoBySlug(first);
  if (modo) {
    if (second === "novo") {
      return [
        base,
        { label: modo.shortLabel, href: modo.href },
        { label: "Novo" },
      ];
    }

    return [base, { label: modo.label }];
  }

  if (second === "resultado") {
    return [base, { label: "Resultado" }];
  }

  if (!SIMULADO_SEGMENTOS_RESERVADOS.has(first)) {
    return [base, { label: "Em andamento" }];
  }

  return [base];
}

function trilhaCrumbs(
  pathname: string,
  searchParams: URLSearchParams | null,
): WorkspaceCrumb[] {
  const base: WorkspaceCrumb = {
    label: TRILHA_NAV.label,
    href: TRILHA_NAV.href,
  };

  if (pathname === TRILHA_NAV.href) {
    return [{ label: TRILHA_NAV.label }];
  }

  if (pathname === "/trilha/diagnostico") {
    return [base, { label: "Diagnóstico" }];
  }

  if (pathname === "/trilha/geral") {
    const modalidadeId = searchParams?.get("modalidade");
    const modalidade = modalidadeId ? getModalidadeById(modalidadeId) : undefined;

    if (modalidade) {
      return [
        base,
        { label: "Trilha geral", href: "/trilha/geral" },
        { label: modalidade.nome },
      ];
    }

    return [base, { label: "Trilha geral" }];
  }

  const areaMatch = pathname.match(/^\/trilha\/([^/]+)$/);
  if (areaMatch) {
    const slug = areaMatch[1];
    if (slug === "diagnostico" || slug === "geral") {
      return [base];
    }

    const label = TRILHA_AREA_LABELS[slug] ?? slug;
    return [base, { label }];
  }

  return [base];
}

export function getWorkspaceCrumbs(
  pathname: string,
  searchParams: URLSearchParams | null,
  activeSessionTitle: string | null,
): WorkspaceCrumb[] {
  if (pathname.startsWith("/tutor")) {
    return tutorCrumbs(pathname, activeSessionTitle);
  }

  if (pathname.startsWith(SIMULADOS_NAV.href)) {
    return simuladosCrumbs(pathname);
  }

  if (pathname.startsWith(TRILHA_NAV.href)) {
    return trilhaCrumbs(pathname, searchParams);
  }

  if (pathname.startsWith("/progresso/detalhes")) {
    return [
      { label: PROGRESSO_NAV.label, href: PROGRESSO_NAV.href },
      { label: "Desempenho" },
    ];
  }

  if (pathname.startsWith("/progresso/desempenho")) {
    return [
      { label: PROGRESSO_NAV.label, href: PROGRESSO_NAV.href },
      { label: "Desempenho" },
    ];
  }

  if (pathname.startsWith("/progresso/rotina")) {
    return [
      { label: PROGRESSO_NAV.label, href: PROGRESSO_NAV.href },
      { label: "Rotina" },
    ];
  }

  if (pathname.startsWith("/progresso/foco")) {
    return [
      { label: PROGRESSO_NAV.label, href: PROGRESSO_NAV.href },
      { label: "Foco agora" },
    ];
  }

  if (pathname.startsWith(PROGRESSO_NAV.href)) {
    return [{ label: PROGRESSO_NAV.label }];
  }

  if (pathname.startsWith(PROFILE_NAV.href)) {
    return [{ label: PROFILE_NAV.label }];
  }

  if (pathname.startsWith(PLANOS_NAV.href)) {
    return [{ label: PLANOS_NAV.label }];
  }

  return [];
}
