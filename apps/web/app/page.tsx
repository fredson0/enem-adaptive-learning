import { HeroSection } from "@/components/landing/hero-section";
import { LandingPlans } from "@/components/landing/landing-plans";
import { LandingPlatformShowcase } from "@/components/landing/landing-platform-showcase";
import { LandingProductShowcase } from "@/components/landing/landing-product-showcase";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-white">
      <SiteHeader />
      <HeroSection />

      <LandingProductShowcase />
      <LandingPlatformShowcase />
      <LandingTestimonials />
      <LandingPlans />
      <SiteFooter />
    </main>
  );
}
