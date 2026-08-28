"use client";

import { fetchPlano, type PlanoAssinatura } from "@/lib/plano";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PlanoContextValue = {
  plano: PlanoAssinatura;
  loading: boolean;
  refresh: () => Promise<void>;
};

const DEFAULT_PLANO: PlanoAssinatura = {
  tipo: "GRATUITO",
  label: "Gratuito",
  tokensDiarios: 10,
  ativo: true,
};

const PlanoContext = createContext<PlanoContextValue | null>(null);

export function PlanoProvider({ children }: { children: ReactNode }) {
  const [plano, setPlano] = useState<PlanoAssinatura | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPlano();
      setPlano(data);
    } catch {
      setPlano(DEFAULT_PLANO);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ plano: plano ?? DEFAULT_PLANO, loading, refresh }),
    [plano, loading, refresh],
  );

  return (
    <PlanoContext.Provider value={value}>{children}</PlanoContext.Provider>
  );
}

export function usePlano() {
  const ctx = useContext(PlanoContext);
  if (!ctx) {
    throw new Error("usePlano must be used within PlanoProvider");
  }
  return ctx;
}
