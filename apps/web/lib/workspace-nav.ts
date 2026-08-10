import {
  BarChart3,
  BookOpen,
  Route,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export type WorkspaceNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const WORKSPACE_NAV: WorkspaceNavItem[] = [
  {
    label: "Trilha",
    href: "/trilha",
    icon: Route,
    description: "Áreas fracas e próximos tópicos",
  },
  {
    label: "Progresso",
    href: "/progresso",
    icon: BarChart3,
    description: "Proficiência por área do ENEM",
  },
];

export const TUTOR_NAV = {
  label: "Tutor IA",
  href: "/tutor",
  icon: MessageSquare,
} as const;

export const PROFILE_NAV = {
  label: "Perfil",
  href: "/perfil",
  icon: BookOpen,
} as const;

export function isActivePath(pathname: string, href: string) {
  if (href === "/tutor") {
    return pathname === "/tutor" || pathname.startsWith("/tutor/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
