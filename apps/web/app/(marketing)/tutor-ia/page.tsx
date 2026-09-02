import type { Metadata } from "next";
import { TutorIaContent } from "./tutor-ia-content";

export const metadata: Metadata = {
  title: "Tutor IA | ENEM+IA",
  description:
    "Tutor virtual com IA para o ENEM: chat contextual, upload de fotos, explicação de erros e dicas durante simulados.",
};

export default function TutorIaPage() {
  return <TutorIaContent />;
}
