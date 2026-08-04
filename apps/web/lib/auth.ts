export type UserPerfil = {
  cursoObjetivo: string | null;
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

export type LoginResponse = {
  accessToken: string;
  user: User;
};

const TOKEN_KEY = "enem_access_token";
const USER_KEY = "enem_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(accessToken: string, user: User) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `enem_access_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "enem_access_token=; path=/; max-age=0; SameSite=Lax";
}

export function isOnboardingComplete(user: User | null) {
  return Boolean(user?.perfil?.onboardingCompleto);
}
