"use client";

import { WorkspaceSection } from "@/components/workspace/workspace-section";
import { LogoutButton } from "@/components/workspace/logout-button";
import { apiFetch, fetchMe } from "@/lib/api";
import { type User } from "@/lib/auth";
import {
  formatNivelAtual,
  formatSerieEscolar,
  formatTipoEnsinoMedio,
} from "@/lib/profile-labels";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await fetchMe();
        if (cancelled) return;

        if (!me) {
          router.replace("/login");
          return;
        }

        const profile = await apiFetch<User>("/usuarios/perfil", { auth: true });
        if (!cancelled) setUser(profile);
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <WorkspaceSection title="Perfil">
        <p className="text-sm text-white/45">Carregando perfil…</p>
      </WorkspaceSection>
    );
  }

  if (!user) {
    return (
      <WorkspaceSection title="Perfil">
        <p className="text-sm text-red-400">Não foi possível carregar o perfil.</p>
      </WorkspaceSection>
    );
  }

  return (
    <WorkspaceSection title="Perfil">
      <div className="max-w-xl rounded-[14px] border border-white/[0.06] bg-[#161616] p-6 md:p-8">
        <div className="mb-8 flex items-center gap-4">
          {user.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.fotoUrl}
              alt=""
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-[#252525] text-lg font-semibold text-white">
              {getInitials(user.nome)}
            </div>
          )}
          <div>
            <p className="text-lg font-medium text-white">{user.nome}</p>
            <p className="text-sm text-white/45">{user.email}</p>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <p className="text-white/40">Plano atual</p>
            <p className="mt-1.5 text-white">Gratuito</p>
          </div>
          <div>
            <p className="text-white/40">Curso ou objetivo</p>
            <p className="mt-1.5 text-white">
              {user.perfil.cursoObjetivo ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-white/40">Ano escolar</p>
            <p className="mt-1.5 text-white">
              {formatSerieEscolar(user.perfil.serieEscolar)}
            </p>
          </div>
          <div>
            <p className="text-white/40">Ensino médio</p>
            <p className="mt-1.5 text-white">
              {formatTipoEnsinoMedio(user.perfil.tipoEnsinoMedio)}
            </p>
          </div>
          <div>
            <p className="text-white/40">Nível</p>
            <p className="mt-1.5 text-white">
              {formatNivelAtual(user.perfil.nivelAtual)}
            </p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </WorkspaceSection>
  );
}
