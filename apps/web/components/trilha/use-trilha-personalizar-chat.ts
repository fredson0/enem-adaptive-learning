"use client";

import {
  conversarPersonalizarTrilha,
  finalizarPersonalizarTrilha,
  type MensagemHistorico,
} from "@/lib/ia-tutor";
import type { TrilhaResponse } from "@/lib/trilha";
import type { AreaEnemSlug } from "@/lib/simulados";
import { emitirTrilhaAtualizada } from "@/lib/trilha-events";
import { scrollWorkspaceToTop } from "@/lib/scroll-workspace";
import { useCallback, useEffect, useRef, useState } from "react";

type UseTrilhaPersonalizarChatOptions = {
  areaSlug?: AreaEnemSlug;
  onAtualizado?: (trilha: TrilhaResponse) => void;
};

export function useTrilhaPersonalizarChat({
  areaSlug,
  onAtualizado,
}: UseTrilhaPersonalizarChatOptions) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemHistorico[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [areaAtiva, setAreaAtiva] = useState<AreaEnemSlug | undefined>(
    areaSlug,
  );
  const [podeFinalizar, setPodeFinalizar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const painelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setAreaAtiva(areaSlug);
  }, [areaSlug]);

  const scrollParaChat = useCallback(() => {
    scrollWorkspaceToTop("instant");
    requestAnimationFrame(() => {
      painelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (!aberto) return;
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [aberto, mensagens, loading]);

  const iniciarConversa = useCallback(async () => {
    setIniciando(true);
    setError(null);
    try {
      const response = await conversarPersonalizarTrilha({
        areaSlug,
        iniciar: true,
        historico: [],
      });
      setAreaAtiva(response.areaSlug as AreaEnemSlug);
      setMensagens([{ role: "assistant", texto: response.resposta }]);
      setPodeFinalizar(response.podeFinalizar);
      scrollParaChat();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível iniciar a conversa.",
      );
      setAberto(false);
    } finally {
      setIniciando(false);
    }
  }, [areaSlug, scrollParaChat]);

  const abrir = useCallback(async () => {
    setAberto(true);
    scrollParaChat();
    if (mensagens.length === 0) {
      await iniciarConversa();
    }
    scrollParaChat();
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [iniciarConversa, mensagens.length, scrollParaChat]);

  const fechar = useCallback(() => {
    setAberto(false);
    setError(null);
  }, []);

  const enviar = useCallback(async () => {
    const texto = input.trim();
    if (!texto || loading) return;

    const historico = [...mensagens];
    const comUsuario: MensagemHistorico[] = [
      ...historico,
      { role: "user", texto },
    ];
    setMensagens(comUsuario);
    setInput("");
    setLoading(true);
    setError(null);
    scrollParaChat();

    try {
      const response = await conversarPersonalizarTrilha({
        areaSlug: areaAtiva,
        mensagem: texto,
        historico,
      });
      setMensagens([
        ...comUsuario,
        { role: "assistant", texto: response.resposta },
      ]);
      setPodeFinalizar(
        response.podeFinalizar ||
          comUsuario.filter((m) => m.role === "user").length >= 2,
      );
    } catch (err) {
      setMensagens(historico);
      setInput(texto);
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar.",
      );
    } finally {
      setLoading(false);
    }
  }, [areaAtiva, input, loading, mensagens, scrollParaChat]);

  const finalizar = useCallback(async () => {
    if (!areaAtiva || mensagens.length === 0) return;

    setFinalizando(true);
    setError(null);
    try {
      const response = await finalizarPersonalizarTrilha({
        areaSlug: areaAtiva,
        historico: mensagens,
      });
      onAtualizado?.(response.trilha);
      emitirTrilhaAtualizada();
      setAberto(false);
      setMensagens([]);
      setPodeFinalizar(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível finalizar o plano.",
      );
    } finally {
      setFinalizando(false);
    }
  }, [areaAtiva, mensagens, onAtualizado]);

  return {
    aberto,
    abrir,
    fechar,
    enviar,
    finalizar,
    mensagens,
    input,
    setInput,
    loading,
    finalizando,
    iniciando,
    podeFinalizar,
    error,
    fimRef,
    inputRef,
    painelRef,
  };
}

export type TrilhaPersonalizarChat = ReturnType<
  typeof useTrilhaPersonalizarChat
>;
