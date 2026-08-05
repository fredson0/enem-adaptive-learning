"use client";

import { apiFetch, fetchMe } from "@/lib/api";
import { isOnboardingComplete, type User } from "@/lib/auth";
import {
  SERIE_ESCOLAR_OPTIONS,
  TIPO_ENSINO_MEDIO_OPTIONS,
  type SerieEscolar,
  type TipoEnsinoMedio,
} from "@/lib/profile-labels";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cursoObjetivo, setCursoObjetivo] = useState("");
  const [serieEscolar, setSerieEscolar] = useState<SerieEscolar | "">("");
  const [tipoEnsinoMedio, setTipoEnsinoMedio] = useState<TipoEnsinoMedio | "">(
    "",
  );
  const [nivelAtual, setNivelAtual] = useState("INICIANTE");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const user = await fetchMe();
        if (cancelled) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        if (isOnboardingComplete(user)) {
          router.replace("/tutor");
          return;
        }

        setNome(user.nome);
        setCursoObjetivo(user.perfil.cursoObjetivo ?? "");
        setSerieEscolar((user.perfil.serieEscolar as SerieEscolar | null) ?? "");
        setTipoEnsinoMedio(
          (user.perfil.tipoEnsinoMedio as TipoEnsinoMedio | null) ?? "",
        );
        setNivelAtual(user.perfil.nivelAtual ?? "INICIANTE");
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!serieEscolar || !tipoEnsinoMedio) {
      setError("Preencha a série escolar e o tipo de ensino médio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiFetch<User>("/usuarios/perfil", {
        method: "PATCH",
        auth: true,
        body: {
          nome,
          cursoObjetivo,
          serieEscolar,
          tipoEnsinoMedio,
          nivelAtual,
        },
      });

      router.push("/tutor");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar o perfil.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (bootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111111] px-6">
        <p className="text-sm text-white/45">Carregando…</p>
      </main>
    );
  }

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
            <span className="text-sm text-white/55">Ano escolar</span>
            <select
              value={serieEscolar}
              onChange={(e) =>
                setSerieEscolar(e.target.value as SerieEscolar | "")
              }
              className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-white/20"
              required
            >
              <option value="" disabled>
                Selecione
              </option>
              {SERIE_ESCOLAR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="block">
            <legend className="text-sm text-white/55">
              Seu ensino médio foi predominantemente
            </legend>
            <div className="mt-3 space-y-2">
              {TIPO_ENSINO_MEDIO_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-white/10 bg-[#111] px-4 py-3 text-sm text-white transition hover:border-white/20"
                >
                  <input
                    type="radio"
                    name="tipoEnsinoMedio"
                    value={option.value}
                    checked={tipoEnsinoMedio === option.value}
                    onChange={(e) =>
                      setTipoEnsinoMedio(e.target.value as TipoEnsinoMedio)
                    }
                    className="mt-0.5"
                    required
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

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
