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

const INPUT_MIN_HEIGHT = 24;
const INPUT_MAX_HEIGHT = 120;

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
  const mensagensRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const painelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setAreaAtiva(areaSlug);
  }, [areaSlug]);

  const ajustarAlturaInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(
      Math.max(el.scrollHeight, INPUT_MIN_HEIGHT),
      INPUT_MAX_HEIGHT,
    )}px`;
  }, []);

  useEffect(() => {
    ajustarAlturaInput();
  }, [input, ajustarAlturaInput]);

  const rolarParaFim = useCallback(() => {
    const el = mensagensRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const scrollParaAbertura = useCallback(() => {
    scrollWorkspaceToTop("instant");
    requestAnimationFrame(() => {
      painelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (!aberto) return;
    requestAnimationFrame(() => {
      rolarParaFim();
    });
  }, [aberto, mensagens, loading, rolarParaFim]);

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
  }, [areaSlug]);

  const abrir = useCallback(async () => {
    setAberto(true);
    scrollParaAbertura();
    if (mensagens.length === 0) {
      await iniciarConversa();
    }
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [iniciarConversa, mensagens.length, scrollParaAbertura]);

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
      requestAnimationFrame(ajustarAlturaInput);
    }
  }, [areaAtiva, input, loading, mensagens, ajustarAlturaInput]);

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
    mensagensRef,
    inputRef,
    painelRef,
  };
}

export type TrilhaPersonalizarChat = ReturnType<
  typeof useTrilhaPersonalizarChat
>;
