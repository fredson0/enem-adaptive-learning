"use client";

import type { TokensIa } from "@/lib/ia-tutor";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TokensIaContextValue = {
  tokens: TokensIa;
  setTokens: (tokens: TokensIa) => void;
};

const DEFAULT_TOKENS: TokensIa = {
  consumo: 0,
  limite: 10,
  restantes: 10,
};

const TokensIaContext = createContext<TokensIaContextValue | null>(null);

export function TokensIaProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokensState] = useState<TokensIa>(DEFAULT_TOKENS);

  const setTokens = useCallback((next: TokensIa) => {
    setTokensState(next);
  }, []);

  const value = useMemo(
    () => ({ tokens, setTokens }),
    [tokens, setTokens],
  );

  return (
    <TokensIaContext.Provider value={value}>{children}</TokensIaContext.Provider>
  );
}

export function useTokensIa() {
  const ctx = useContext(TokensIaContext);
  if (!ctx) {
    throw new Error("useTokensIa must be used within TokensIaProvider");
  }
  return ctx;
}
