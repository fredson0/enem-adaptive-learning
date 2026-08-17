import type { Metadata } from "next";
import { PrecosContent } from "./precos-content";

export const metadata: Metadata = {
  title: "Planos e preços | ENEM+",
  description:
    "Plano gratuito para escolas públicas e plano de apoio simbólico. Simulados, trilha, métricas e tutor IA com modelo freemium sustentável.",
};

export default function PrecosPage() {
  return <PrecosContent />;
}
