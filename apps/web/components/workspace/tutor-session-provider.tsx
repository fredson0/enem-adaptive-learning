"use client";

import type { MensagemHistorico } from "@/lib/ia-tutor";
import {
  atualizarConversaTutor,
  criarConversaTutor,
  excluirConversaTutor,
  listarConversasTutor,
  obterConversaTutor,
} from "@/lib/ia-tutor";
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

export type TutorQuestaoContext = {
  questaoId: string;
  ano: number;
  indice: number;
  simuladoId?: string;
  area?: string;
};

export type TutorChatSession = {
  id: string;
  title: string;
  messages: MensagemHistorico[];
  updatedAt: number;
  preview?: string;
  questaoContext?: TutorQuestaoContext | null;
};

const PINNED_CHATS_STORAGE_KEY = "enem-tutor-pinned-chats";

function readPinnedChats(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PINNED_CHATS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writePinnedChats(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PINNED_CHATS_STORAGE_KEY, JSON.stringify(ids));
}

type TutorSessionContextValue = {
  sessions: TutorChatSession[];
  activeSessionId: string | null;
  activeSession: TutorChatSession | null;
  sessionKey: number;
  isNewChat: boolean;
  loading: boolean;
  pinnedSessionIds: string[];
  startNewChat: () => void;
  startChatWithSeed: (
    messages: MensagemHistorico[],
    questaoContext?: TutorQuestaoContext,
  ) => Promise<void>;
  goToTutor: () => void;
  openSession: (id: string) => Promise<void>;
  registerConversation: (session: TutorChatSession) => void;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, titulo: string) => Promise<void>;
  togglePinSession: (id: string) => void;
};

const TutorSessionContext = createContext<TutorSessionContextValue | null>(null);

function toSession(conversa: {
  id: string;
  titulo: string;
  preview?: string;
  mensagens?: MensagemHistorico[];
  atualizadoEm: string;
}): TutorChatSession {
  return {
    id: conversa.id,
    title: conversa.titulo,
    messages: conversa.mensagens ?? [],
    preview: conversa.preview,
    updatedAt: new Date(conversa.atualizadoEm).getTime(),
  };
}

export function TutorSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<TutorChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [pinnedSessionIds, setPinnedSessionIds] = useState<string[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPinnedSessionIds(readPinnedChats());
  }, []);

  const refreshSessions = useCallback(async () => {
    const conversas = await listarConversasTutor();
    setSessions(
      conversas.map((conversa) =>
        toSession({
          id: conversa.id,
          titulo: conversa.titulo,
          preview: conversa.preview,
          atualizadoEm: conversa.atualizadoEm,
        }),
      ),
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshSessions();
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshSessions]);

  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
    setSessionKey((key) => key + 1);
    router.push(TUTOR_CHAT_PATH);
  }, [router]);

  const startChatWithSeed = useCallback(
    async (
      messages: MensagemHistorico[],
      questaoContext?: TutorQuestaoContext,
    ) => {
      const conversa = await criarConversaTutor(messages);
      const session: TutorChatSession = {
        ...toSession(conversa),
        questaoContext: questaoContext ?? null,
      };

      setSessions((current) => {
        const without = current.filter((item) => item.id !== session.id);
        return [session, ...without];
      });
      setActiveSessionId(session.id);
      setSessionKey((key) => key + 1);
      router.push(TUTOR_CHAT_PATH);
    },
    [router],
  );

  const goToTutor = useCallback(() => {
    if (pathname !== TUTOR_CHAT_PATH) {
      router.push(TUTOR_CHAT_PATH);
    }
  }, [pathname, router]);

  const openSession = useCallback(
    async (id: string) => {
      try {
        const cached = sessions.find((session) => session.id === id);

        if (!cached || cached.messages.length === 0) {
          const conversa = await obterConversaTutor(id);
          const session = toSession(conversa);

          setSessions((current) => {
            const without = current.filter((item) => item.id !== session.id);
            return [session, ...without];
          });
        }

        setActiveSessionId(id);
        setSessionKey((key) => key + 1);

        if (pathname !== TUTOR_CHAT_PATH) {
          router.push(TUTOR_CHAT_PATH);
        }
      } catch {
        startNewChat();
      }
    },
    [pathname, router, sessions, startNewChat],
  );

  const registerConversation = useCallback((session: TutorChatSession) => {
    setSessions((current) => {
      const without = current.filter((item) => item.id !== session.id);
      return [session, ...without];
    });
    setActiveSessionId(session.id);
  }, []);

  const deleteSession = useCallback(
    async (id: string) => {
      await excluirConversaTutor(id);

      setSessions((current) => current.filter((session) => session.id !== id));
      setPinnedSessionIds((current) => {
        const next = current.filter((item) => item !== id);
        writePinnedChats(next);
        return next;
      });

      if (activeSessionId === id) {
        setActiveSessionId(null);
        setSessionKey((key) => key + 1);
        router.push(TUTOR_CHAT_PATH);
      }
    },
    [activeSessionId, router],
  );

  const renameSession = useCallback(async (id: string, titulo: string) => {
    await atualizarConversaTutor(id, titulo);
    setSessions((current) =>
      current.map((session) =>
        session.id === id ? { ...session, title: titulo } : session,
      ),
    );
  }, []);

  const togglePinSession = useCallback((id: string) => {
    setPinnedSessionIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      writePinnedChats(next);
      return next;
    });
  }, []);

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
      sessionKey,
      isNewChat,
      loading,
      pinnedSessionIds,
      startNewChat,
      startChatWithSeed,
      goToTutor,
      openSession,
      registerConversation,
      deleteSession,
      renameSession,
      togglePinSession,
    }),
    [
      sessions,
      activeSessionId,
      activeSession,
      sessionKey,
      isNewChat,
      loading,
      pinnedSessionIds,
      startNewChat,
      startChatWithSeed,
      goToTutor,
      openSession,
      registerConversation,
      deleteSession,
      renameSession,
      togglePinSession,
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
