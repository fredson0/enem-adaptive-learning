"use client";

import { fetchMe } from "@/lib/api";
import type { User } from "@/lib/auth";
import { getLoginPath, isGuestAllowedPath } from "@/lib/login-redirect";
import { savePendingTutorPrompt } from "@/lib/pending-tutor-prompt";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RequireAuthOptions = {
  next?: string;
  tutorPrompt?: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<User | null>;
  requireAuth: (options?: RequireAuthOptions) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const profile = await fetchMe();
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profile = await fetchMe();
        if (!cancelled) setUser(profile);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const requireAuth = useCallback(
    (options?: RequireAuthOptions) => {
      if (user) return true;

      const next =
        options?.next ??
        `${window.location.pathname}${window.location.search}`;

      if (options?.tutorPrompt?.trim()) {
        savePendingTutorPrompt(options.tutorPrompt);
      }

      router.push(getLoginPath(next));
      return false;
    },
    [router, user],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshUser,
      requireAuth,
    }),
    [user, isLoading, refreshUser, requireAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
