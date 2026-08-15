"use client";

import { SiteHeader } from "@/components/landing/site-header";
import { LandingArcCarousel } from "@/components/landing/landing-arc-carousel";
import { loginWithGoogleIdToken, fetchMe } from "@/lib/api";
import { isOnboardingComplete } from "@/lib/auth";
import { getSafeRedirectPath } from "@/lib/login-redirect";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
          router.replace("/onboarding");
          return;
        }

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
      <main className="relative min-h-screen overflow-hidden bg-[#201d1d]">
        <SiteHeader variant="auth" />
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-8 animate-pulse rounded-full bg-white/10" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#201d1d]">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <LandingArcCarousel variant="background" />
        <div className="absolute inset-0 bg-[#201d1d]/75 md:bg-[#201d1d]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#201d1d_78%)] md:bg-[radial-gradient(circle_at_center,transparent_0%,#201d1d_72%)]" />
      </div>

      <SiteHeader variant="auth" />

      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-5 pt-24 pb-10 sm:px-6 sm:pt-28 sm:pb-12">
        <h1 className="font-display text-center text-[clamp(2.25rem,10vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-white">
          Entrar
        </h1>

        <div className="relative z-30 mt-6 w-full max-w-md rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:mt-8 sm:p-8 md:p-10">
          <p className="text-sm leading-relaxed text-[#111111]/65">
            Use sua conta Google para acessar o tutor IA, simulados e trilha
            personalizada.
          </p>

          <div className="mt-8 flex justify-center">
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={(response) => handleSuccess(response.credential)}
                onError={() => setError("Login com Google cancelado.")}
                theme="outline"
                shape="pill"
                size="large"
                text="continue_with"
                width="320"
              />
            ) : (
              <p className="text-center text-sm text-amber-700">
                Configure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no `.env.local`.
              </p>
            )}
          </div>

          {loading ? (
            <p className="mt-4 text-center text-sm text-[#111111]/50">Entrando…</p>
          ) : null}

          {error ? (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          ) : null}
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          Ainda não tem conta?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="font-medium text-white underline underline-offset-4 transition hover:text-white/85"
          >
            Comece com Google
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen overflow-hidden bg-[#201d1d]">
          <SiteHeader variant="auth" />
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
