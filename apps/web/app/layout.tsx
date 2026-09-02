import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { GoogleAuthProvider } from "@/components/providers/google-auth-provider";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeScript } from "@/components/providers/theme-script";
import { BRAND_NAME } from "@/lib/brand";
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
  title: `${BRAND_NAME} | Plataforma Educacional Adaptativa`,
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
      suppressHydrationWarning
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full overflow-x-hidden bg-background text-foreground">
        <ThemeProvider>
          <GoogleAuthProvider>
            <SmoothScrollProvider>
              <PageTransitionProvider>{children}</PageTransitionProvider>
            </SmoothScrollProvider>
          </GoogleAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
