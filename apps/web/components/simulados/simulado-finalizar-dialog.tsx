"use client";

import { OsmoDialog } from "@/components/ui/osmo-dialog";

type SimuladoFinalizarDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  respondidas: number;
  totalQuestoes: number;
  submitting?: boolean;
};

export function SimuladoFinalizarDialog({
  open,
  onClose,
  onConfirm,
  respondidas,
  totalQuestoes,
  submitting = false,
}: SimuladoFinalizarDialogProps) {
  const restantes = Math.max(totalQuestoes - respondidas, 0);

  return (
    <OsmoDialog
      open={open}
      onClose={onClose}
      title="Finalizar simulado agora?"
      description={
        restantes > 0
          ? `Você respondeu ${respondidas} de ${totalQuestoes} questões. As ${restantes} restantes não serão respondidas e o simulado será encerrado com o desempenho atual.`
          : "O simulado será encerrado e você verá o resultado com base nas respostas já enviadas."
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/25 hover:text-white disabled:opacity-50"
          >
            Continuar simulado
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {submitting ? "Finalizando…" : "Finalizar simulado"}
          </button>
        </>
      }
    />
  );
}
