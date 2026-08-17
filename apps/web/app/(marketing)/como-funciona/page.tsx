import type { Metadata } from "next";
import { ComoFuncionaContent } from "./como-funciona-content";

export const metadata: Metadata = {
  title: "Como funciona | ENEM+",
  description:
    "Entenda o fluxo do ENEM+: diagnóstico, simulados adaptativos, métricas de proficiência e trilha personalizada com tutor IA.",
};

export default function ComoFuncionaPage() {
  return <ComoFuncionaContent />;
}
