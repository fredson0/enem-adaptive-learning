import type { Metadata } from "next";
import { ComoFuncionaContent } from "./como-funciona-content";

export const metadata: Metadata = {
  title: "Como funciona | ENEM+IA",
  description:
    "Entenda o fluxo do ENEM+IA: diagnóstico, simulados adaptativos, métricas de proficiência e trilha personalizada com tutor IA.",
};

export default function ComoFuncionaPage() {
  return <ComoFuncionaContent />;
}
