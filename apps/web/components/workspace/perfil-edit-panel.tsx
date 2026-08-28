"use client";

import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/auth";
import {
  SERIE_ESCOLAR_OPTIONS,
  TIPO_ENSINO_MEDIO_OPTIONS,
  type SerieEscolar,
  type TipoEnsinoMedio,
} from "@/lib/profile-labels";
import { useState } from "react";

type PerfilEditPanelProps = {
  user: User;
  onSaved: (user: User) => void;
};

const NIVEL_OPTIONS = [
  { value: "INICIANTE", label: "Iniciante" },
  { value: "INTERMEDIARIO", label: "Intermediário" },
  { value: "AVANCADO", label: "Avançado" },
];

export function PerfilEditPanel({ user, onSaved }: PerfilEditPanelProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState(user.nome);
  const [cursoObjetivo, setCursoObjetivo] = useState(
    user.perfil.cursoObjetivo ?? "",
  );
  const [serieEscolar, setSerieEscolar] = useState<SerieEscolar | "">(
    (user.perfil.serieEscolar as SerieEscolar | null) ?? "",
  );
  const [tipoEnsinoMedio, setTipoEnsinoMedio] = useState<TipoEnsinoMedio | "">(
    (user.perfil.tipoEnsinoMedio as TipoEnsinoMedio | null) ?? "",
  );
  const [nivelAtual, setNivelAtual] = useState(
    user.perfil.nivelAtual ?? "INICIANTE",
  );

  const resetForm = () => {
    setNome(user.nome);
    setCursoObjetivo(user.perfil.cursoObjetivo ?? "");
    setSerieEscolar((user.perfil.serieEscolar as SerieEscolar | null) ?? "");
    setTipoEnsinoMedio(
      (user.perfil.tipoEnsinoMedio as TipoEnsinoMedio | null) ?? "",
    );
    setNivelAtual(user.perfil.nivelAtual ?? "INICIANTE");
    setError(null);
  };

  const handleSave = async () => {
    if (!serieEscolar || !tipoEnsinoMedio) {
      setError("Preencha a série escolar e o tipo de ensino médio.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await apiFetch<User>("/usuarios/perfil", {
        method: "PATCH",
        auth: true,
        body: {
          nome: nome.trim(),
          cursoObjetivo: cursoObjetivo.trim() || undefined,
          serieEscolar,
          tipoEnsinoMedio,
          nivelAtual,
        },
      });

      onSaved(updated);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-[10px] border border-white/10 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.04] hover:text-white"
      >
        Editar perfil
      </button>
    );
  }

  return (
    <form
      className="mt-6 space-y-4 border-t border-white/[0.06] pt-6"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <p className="text-sm font-medium text-white">Editar perfil</p>

      <label className="block space-y-1.5 text-sm">
        <span className="text-white/40">Nome</span>
        <input
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          className="w-full rounded-[10px] border border-white/10 bg-[#111] px-3 py-2.5 text-white outline-none focus:border-white/25"
          required
          minLength={2}
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="text-white/40">Curso ou objetivo</span>
        <input
          value={cursoObjetivo}
          onChange={(event) => setCursoObjetivo(event.target.value)}
          className="w-full rounded-[10px] border border-white/10 bg-[#111] px-3 py-2.5 text-white outline-none focus:border-white/25"
          placeholder="Ex.: Medicina na USP"
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="text-white/40">Ano escolar</span>
        <select
          value={serieEscolar}
          onChange={(event) =>
            setSerieEscolar(event.target.value as SerieEscolar)
          }
          className="w-full rounded-[10px] border border-white/10 bg-[#111] px-3 py-2.5 text-white outline-none focus:border-white/25"
          required
        >
          <option value="">Selecione</option>
          {SERIE_ESCOLAR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="text-white/40">Ensino médio</span>
        <select
          value={tipoEnsinoMedio}
          onChange={(event) =>
            setTipoEnsinoMedio(event.target.value as TipoEnsinoMedio)
          }
          className="w-full rounded-[10px] border border-white/10 bg-[#111] px-3 py-2.5 text-white outline-none focus:border-white/25"
          required
        >
          <option value="">Selecione</option>
          {TIPO_ENSINO_MEDIO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="text-white/40">Nível</span>
        <select
          value={nivelAtual}
          onChange={(event) => setNivelAtual(event.target.value)}
          className="w-full rounded-[10px] border border-white/10 bg-[#111] px-3 py-2.5 text-white outline-none focus:border-white/25"
        >
          {NIVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            resetForm();
            setEditing(false);
          }}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.04]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
