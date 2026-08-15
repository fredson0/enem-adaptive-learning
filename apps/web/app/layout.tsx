import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { GoogleAuthProvider } from "@/components/providers/google-auth-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ENEM+ | Plataforma Educacional Adaptativa",
  description:
    "Prepare-se para o ENEM com simulados adaptativos, tutor IA e métricas de proficiência. Inclusão digital para estudantes de escolas públicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-[#05070d] text-white">
        <GoogleAuthProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
