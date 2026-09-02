"use client";

import { LandingArcCarousel } from "@/components/landing/landing-arc-carousel";
import { OsmoGoogleLoginButton } from "@/components/landing/osmo-google-login-button";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { MarketingClipTitle } from "@/components/marketing/marketing-clip-title";
import { MarketingOsmoFaq } from "@/components/marketing/marketing-osmo-faq";
import { loginWithGoogleIdToken, fetchMe } from "@/lib/api";
import { isOnboardingComplete } from "@/lib/auth";
import { getSafeRedirectPath } from "@/lib/login-redirect";
import { resetPageTransitionOverlay } from "@/lib/page-transition";
import { MARKETING_FAQ_CATEGORIES } from "@/lib/marketing-faq";
import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";
import { Caveat } from "next/font/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const LOGIN_FAQ = MARKETING_FAQ_CATEGORIES.filter((category) =>
  ["geral", "ia-planos"].includes(category.id),
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeRedirectPath(searchParams.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const user = await fetchMe();
        if (cancelled || !user) return;

        if (!isOnboardingComplete(user)) {
          resetPageTransitionOverlay();
          router.replace("/onboarding");
          return;
        }

        resetPageTransitionOverlay();
        router.replace(nextPath);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  const handleSuccess = async (credential?: string) => {
    if (!credential) {
      setError("Não foi possível obter credencial do Google.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user } = await loginWithGoogleIdToken(credential);

      if (!isOnboardingComplete(user)) {
        router.push("/onboarding");
        return;
      }

      router.push(nextPath);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main
        className="relative min-h-screen overflow-hidden"
        style={{ backgroundColor: MARKETING_OSMO_COLORS.osmoCanvas }}
      >
        <SiteHeader />
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-8 animate-pulse rounded-full bg-white/10" />
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: MARKETING_OSMO_COLORS.osmoCanvas }}
    >
      <section className="relative min-h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <LandingArcCarousel variant="background" />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, transparent 0%, ${MARKETING_OSMO_COLORS.osmoCanvas} 78%)`,
            }}
          />
        </div>

        <SiteHeader />

        <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-5 pt-28 pb-16 sm:px-6 sm:pt-36">
          <MarketingClipTitle
            as="h1"
            playOnMount
            className="font-display text-[clamp(2.25rem,10vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-white"
          >
            Entrar
          </MarketingClipTitle>

          <div className="relative mt-8 w-full max-w-md">
            <p
              className={`${caveat.className} pointer-events-none absolute -top-7 right-0 hidden text-lg text-[#b0ff57] sm:block`}
            >
              Try ENEM+IA
              <span className="ml-1 inline-block rotate-[-12deg]">↑</span>
            </p>

            <div
              className="rounded-[1.75rem] p-6 sm:p-8 md:p-10"
              style={{ backgroundColor: MARKETING_OSMO_COLORS.osmoCard }}
            >
              <p className="text-[11px] font-medium tracking-[0.18em] text-white/70 uppercase">
                Acesso
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Use sua conta Google para acessar o tutor IA, simulados e trilha
                personalizada.
              </p>

              <div className="mt-8">
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <OsmoGoogleLoginButton
                    onSuccess={handleSuccess}
                    onError={() =>
                      setError(
                        "Não foi possível entrar com o Google. Tente de novo ou recarregue a página.",
                      )
                    }
                  />
                ) : (
                  <p className="text-center text-sm text-amber-400">
                    Configure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no `.env.local`.
                  </p>
                )}
              </div>

              {loading ? (
                <p className="mt-4 text-center text-sm text-white/45">
                  Entrando…
                </p>
              ) : null}

              {error ? (
                <p className="mt-4 text-center text-sm text-red-400">{error}</p>
              ) : null}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-white/55">
            Ainda não tem conta?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              className="font-medium text-white underline underline-offset-4 transition hover:text-white/85"
            >
              Comece com Google
            </Link>
          </p>
        </div>
      </section>

      <MarketingOsmoFaq
        categories={LOGIN_FAQ}
        title="Dúvidas?"
        titleLine2="Temos respostas."
        accentNote="sem ChatGPT escondido ;)"
        className="bg-[#f3f3f1]"
      />

      <SiteFooter />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          className="relative min-h-screen overflow-hidden"
          style={{ backgroundColor: MARKETING_OSMO_COLORS.osmoCanvas }}
        >
          <SiteHeader />
          <div className="flex min-h-screen items-center justify-center">
            <div className="size-8 animate-pulse rounded-full bg-white/10" />
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
