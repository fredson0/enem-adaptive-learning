import { HeroSection } from "@/components/landing/hero-section";
import { LandingProductShowcase } from "@/components/landing/landing-product-showcase";
import { SiteHeader } from "@/components/landing/site-header";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-white">
      <SiteHeader />
      <HeroSection />

      <LandingProductShowcase />

      <section
        id="planos"
        data-scroll-section
        className="relative bg-white px-4 py-24 md:px-8"
      >
        <div className="mx-auto max-w-4xl rounded-[16px] border border-black/[0.08] bg-[#f7f7f5] p-8 text-center md:p-12">
          <p className="font-mono text-xs tracking-[0.2em] text-[#2563eb] uppercase">
            Planos
          </p>
          <h2 className="mt-4 text-3xl font-bold text-[#0b1220]">
            Gratuito para escola pública. Apoio para quem pode contribuir.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#0b1220]/65">
            Em breve: integração com login Google e checkout Mercado Pago.
          </p>
        </div>
      </section>
    </main>
  );
}
