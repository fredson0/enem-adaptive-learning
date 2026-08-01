import { BloimAnimationBackground } from "@/components/ui/bloim-animation-background";
import { HeroSection } from "@/components/landing/hero-section";
import { SiteHeader } from "@/components/landing/site-header";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <BloimAnimationBackground />
      <SiteHeader />
      <HeroSection />

      <section
        id="como-funciona"
        data-scroll-section
        className="relative border-t border-white/8 bg-[#080b12]/70 px-4 py-24 backdrop-blur-sm md:px-8"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-[#60a5fa] uppercase">
            Como funciona
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
            Aprendizado adaptativo de verdade
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            O sistema identifica suas lacunas, gera simulados personalizados e
            explica seus erros com um tutor de IA — tudo com limites justos no
            plano gratuito.
          </p>
        </div>
      </section>

      <section id="planos" data-scroll-section className="relative px-4 py-24 md:px-8">
        <div className="mx-auto max-w-4xl rounded-[10px] border border-white/10 bg-[#111827]/80 p-8 text-center backdrop-blur-md md:p-12">
          <p className="font-mono text-xs tracking-[0.2em] text-[#60a5fa] uppercase">
            Planos
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Gratuito para escola pública. Apoio para quem pode contribuir.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            Em breve: integração com login Google e checkout Mercado Pago.
          </p>
        </div>
      </section>
    </main>
  );
}
