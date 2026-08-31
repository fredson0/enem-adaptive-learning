"use client";

import { personalizarTrilhaComIa } from "@/lib/ia-tutor";
import {
  marcarChecklistIa,
  type TrilhaResponse,
} from "@/lib/trilha";
import { emitirTrilhaAtualizada } from "@/lib/trilha-events";
import { recalcularTrilhaProgresso } from "@/lib/trilha-progresso";
import { useCallback, useState } from "react";

type UsePlanoSemanalIaOptions = {
  onTrilhaAtualizada?: (trilha: TrilhaResponse) => void;
};

export function usePlanoSemanalIa({ onTrilhaAtualizada }: UsePlanoSemanalIaOptions = {}) {
  const [gerando, setGerando] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gerarPlano = useCallback(async () => {
    setGerando(true);
    setError(null);
    try {
      const resultado = await personalizarTrilhaComIa();
      const trilha = recalcularTrilhaProgresso(resultado.trilha);
      onTrilhaAtualizada?.(trilha);
      emitirTrilhaAtualizada();
      return trilha;
    } catch (err) {
      const mensagem =
        err instanceof Error
          ? err.message
          : "Não foi possível gerar o plano agora.";
      setError(mensagem);
      return null;
    } finally {
      setGerando(false);
    }
  }, [onTrilhaAtualizada]);

  const toggleChecklist = useCallback(
    async (trilha: TrilhaResponse, itemId: string, concluida: boolean) => {
      setTogglingId(itemId);
      setError(null);
      try {
        await marcarChecklistIa(itemId, concluida);
        const atualizada = recalcularTrilhaProgresso({
          ...trilha,
          checklistIa: trilha.checklistIa.map((item) =>
            item.id === itemId ? { ...item, concluida } : item,
          ),
        });
        onTrilhaAtualizada?.(atualizada);
        emitirTrilhaAtualizada();
        return atualizada;
      } catch (err) {
        const mensagem =
          err instanceof Error
            ? err.message
            : "Não foi possível atualizar o checklist.";
        setError(mensagem);
        return null;
      } finally {
        setTogglingId(null);
      }
    },
    [onTrilhaAtualizada],
  );

  return {
    gerando,
    togglingId,
    error,
    gerarPlano,
    toggleChecklist,
    limparErro: () => setError(null),
  };
}
