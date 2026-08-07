"use client";

import type { MensagemHistorico } from "@/lib/ia-tutor";
import {
  criarConversaTutor,
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

export type TutorChatSession = {
  id: string;
  title: string;
  messages: MensagemHistorico[];
  updatedAt: number;
  preview?: string;
};

type TutorSessionContextValue = {
  sessions: TutorChatSession[];
  activeSessionId: string | null;
  activeSession: TutorChatSession | null;
  sessionKey: number;
  isNewChat: boolean;
  loading: boolean;
  startNewChat: () => void;
  startChatWithSeed: (messages: MensagemHistorico[]) => Promise<void>;
  goToTutor: () => void;
  openSession: (id: string) => Promise<void>;
  registerConversation: (session: TutorChatSession) => void;
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
  const [sessionKey, setSessionKey] = useState(0);
  const [loading, setLoading] = useState(true);

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
    async (messages: MensagemHistorico[]) => {
      const conversa = await criarConversaTutor(messages);
      const session = toSession(conversa);

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
      startNewChat,
      startChatWithSeed,
      goToTutor,
      openSession,
      registerConversation,
    }),
    [
      sessions,
      activeSessionId,
      activeSession,
      sessionKey,
      isNewChat,
      loading,
      startNewChat,
      startChatWithSeed,
      goToTutor,
      openSession,
      registerConversation,
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
