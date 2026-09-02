import type { Metadata } from "next";
import { HomePage } from "@/components/landing/home-page";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND_NAME} | Plataforma Educacional Adaptativa`,
  description:
    "Prepare-se para o ENEM com simulados adaptativos, tutor IA e métricas de proficiência. Inclusão digital para estudantes de escolas públicas.",
};

export default function Page() {
  return <HomePage />;
}
