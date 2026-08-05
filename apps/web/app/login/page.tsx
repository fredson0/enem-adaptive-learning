"use client";

import { loginWithGoogleIdToken } from "@/lib/api";
import { isOnboardingComplete } from "@/lib/auth";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      router.push("/tutor");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-6">
      <div className="w-full max-w-md rounded-[14px] border border-white/[0.06] bg-[#161616] p-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-[0.18em] text-white uppercase"
        >
          ENEM+
        </Link>
        <h1 className="mt-8 text-2xl font-medium text-white">Entrar</h1>
        <p className="mt-2 text-sm text-white/50">
          Use sua conta Google para acessar o tutor IA e os simulados.
        </p>

        <div className="mt-8 flex justify-center">
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <GoogleLogin
              onSuccess={(response) => handleSuccess(response.credential)}
              onError={() => setError("Login com Google cancelado.")}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          ) : (
            <p className="text-sm text-amber-300/90">
              Configure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no `.env.local`.
            </p>
          )}
        </div>

        {loading ? (
          <p className="mt-4 text-center text-sm text-white/45">Entrando…</p>
        ) : null}

        {error ? (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        ) : null}
      </div>
    </main>
  );
}
