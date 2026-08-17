import type { Metadata } from "next";
import { TrilhaPersonalizadaContent } from "./trilha-content";

export const metadata: Metadata = {
  title: "Trilha personalizada | ENEM+",
  description:
    "Trilha de estudos adaptativa para o ENEM: diagnóstico, priorização por área, checklist com IA e etapas sequenciais.",
};

export default function TrilhaPersonalizadaPage() {
  return <TrilhaPersonalizadaContent />;
}
