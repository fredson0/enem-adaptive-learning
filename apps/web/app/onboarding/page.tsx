"use client";

import { apiFetch } from "@/lib/api";
import {
  getAccessToken,
  getStoredUser,
  isOnboardingComplete,
  setSession,
  type User,
} from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cursoObjetivo, setCursoObjetivo] = useState("");
  const [nivelAtual, setNivelAtual] = useState("INICIANTE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (isOnboardingComplete(user)) {
      router.replace("/tutor");
      return;
    }

    setNome(user.nome);
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await apiFetch<User>("/usuarios/perfil", {
        method: "PATCH",
        token,
        body: {
          nome,
          cursoObjetivo,
          nivelAtual,
        },
      });

      setSession(token, updated);
      router.push("/tutor");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar o perfil.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[14px] border border-white/[0.06] bg-[#161616] p-8"
      >
        <h1 className="text-2xl font-medium text-white">Bem-vindo ao ENEM+</h1>
        <p className="mt-2 text-sm text-white/50">
          Conte um pouco sobre você para personalizar o tutor.
        </p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-white/55">Nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/55">
              Curso ou objetivo (ex.: Medicina USP)
            </span>
            <input
              value={cursoObjetivo}
              onChange={(e) => setCursoObjetivo(e.target.value)}
              className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/55">Nível atual</span>
            <select
              value={nivelAtual}
              onChange={(e) => setNivelAtual(e.target.value)}
              className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
            >
              <option value="INICIANTE">Iniciante</option>
              <option value="INTERMEDIARIO">Intermediário</option>
              <option value="AVANCADO">Avançado</option>
            </select>
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? "Salvando…" : "Começar"}
        </button>
      </form>
    </main>
  );
}
