"use client";

import type { MensagemHistorico } from "@/lib/ia-tutor";
import { TUTOR_CHAT_PATH } from "@/lib/tutor-navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "enem-tutor-sessions";

export type TutorChatSession = {
  id: string;
  title: string;
  messages: MensagemHistorico[];
  updatedAt: number;
};

type StoredState = {
  sessions: TutorChatSession[];
  activeSessionId: string | null;
};

type TutorSessionContextValue = {
  sessions: TutorChatSession[];
  activeSessionId: string | null;
  activeSession: TutorChatSession | null;
  sessionKey: number;
  isNewChat: boolean;
  startNewChat: () => void;
  startChatWithSeed: (messages: MensagemHistorico[]) => void;
  goToTutor: () => void;
  openSession: (id: string) => void;
  saveMessages: (messages: MensagemHistorico[]) => void;
};

const TutorSessionContext = createContext<TutorSessionContextValue | null>(null);

function loadStoredState(): StoredState {
  if (typeof window === "undefined") {
    return { sessions: [], activeSessionId: null };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], activeSessionId: null };
    const parsed = JSON.parse(raw) as StoredState;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      activeSessionId: parsed.activeSessionId ?? null,
    };
  } catch {
    return { sessions: [], activeSessionId: null };
  }
}

function persistState(state: StoredState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function buildTitle(messages: MensagemHistorico[]) {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return "Nova conversa";
  const text = firstUser.texto.trim();
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

export function TutorSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<TutorChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredState();
    setSessions(stored.sessions);
    setActiveSessionId(stored.activeSessionId);
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (nextSessions: TutorChatSession[], nextActiveId: string | null) => {
      setSessions(nextSessions);
      setActiveSessionId(nextActiveId);
      persistState({ sessions: nextSessions, activeSessionId: nextActiveId });
    },
    [],
  );

  const startNewChat = useCallback(() => {
    persist(sessions, null);
    setSessionKey((key) => key + 1);
    router.push(TUTOR_CHAT_PATH);
  }, [persist, router, sessions]);

  const startChatWithSeed = useCallback(
    (messages: MensagemHistorico[]) => {
      const now = Date.now();
      const newSession: TutorChatSession = {
        id: crypto.randomUUID(),
        title: buildTitle(messages),
        messages,
        updatedAt: now,
      };

      persist([newSession, ...sessions], newSession.id);
      setSessionKey((key) => key + 1);
      router.push(TUTOR_CHAT_PATH);
    },
    [persist, router, sessions],
  );

  const goToTutor = useCallback(() => {
    if (pathname !== TUTOR_CHAT_PATH) {
      router.push(TUTOR_CHAT_PATH);
    }
  }, [pathname, router]);

  const openSession = useCallback(
    (id: string) => {
      const exists = sessions.some((session) => session.id === id);
      if (!exists) {
        startNewChat();
        return;
      }

      persist(sessions, id);
      if (pathname !== TUTOR_CHAT_PATH) {
        router.push(TUTOR_CHAT_PATH);
      }
    },
    [pathname, persist, router, sessions, startNewChat],
  );

  const saveMessages = useCallback(
    (messages: MensagemHistorico[]) => {
      const now = Date.now();

      if (activeSessionId) {
        const nextSessions = sessions.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                messages,
                title: buildTitle(messages),
                updatedAt: now,
              }
            : session,
        );
        persist(nextSessions, activeSessionId);
        return;
      }

      if (messages.length === 0) return;

      const newSession: TutorChatSession = {
        id: crypto.randomUUID(),
        title: buildTitle(messages),
        messages,
        updatedAt: now,
      };

      persist([newSession, ...sessions], newSession.id);
    },
    [activeSessionId, persist, sessions],
  );

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions],
  );

  const isNewChat = pathname === TUTOR_CHAT_PATH && activeSessionId === null;

  const value = useMemo(
    () => ({
      sessions,
      activeSessionId,
      activeSession,
      sessionKey: hydrated ? sessionKey : 0,
      isNewChat,
      startNewChat,
      startChatWithSeed,
      goToTutor,
      openSession,
      saveMessages,
    }),
    [
      sessions,
      activeSessionId,
      activeSession,
      hydrated,
      sessionKey,
      isNewChat,
      startNewChat,
      startChatWithSeed,
      goToTutor,
      openSession,
      saveMessages,
    ],
  );

  return (
    <TutorSessionContext.Provider value={value}>
      {children}
    </TutorSessionContext.Provider>
  );
}

export function useTutorSession() {
  const ctx = useContext(TutorSessionContext);
  if (!ctx) {
    throw new Error("useTutorSession must be used within TutorSessionProvider");
  }
  return ctx;
}
