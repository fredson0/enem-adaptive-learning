/** Nomes dos cookies HttpOnly (só o servidor Next lê/escreve). */
export const ACCESS_COOKIE = "enem_access_token";
export const REFRESH_COOKIE = "enem_refresh_token";

export const ACCESS_MAX_AGE_SEC = 60 * 15; // 15 min
export const REFRESH_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 dias

export type UserPerfil = {
  cursoObjetivo: string | null;
  serieEscolar: string | null;
  tipoEnsinoMedio: string | null;
  nivelAtual: string;
  tempoDiarioMinutos: number;
  onboardingCompleto: boolean;
};

export type User = {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
  role: string;
  perfil: UserPerfil;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function isOnboardingComplete(user: User | null) {
  if (!user?.perfil) return false;

  const { cursoObjetivo, serieEscolar, tipoEnsinoMedio } = user.perfil;

  return Boolean(cursoObjetivo && serieEscolar && tipoEnsinoMedio);
}

/** Cookie options para Set-Cookie no Route Handler (domínio do Next). */
export function authCookieOptions(maxAge: number) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
