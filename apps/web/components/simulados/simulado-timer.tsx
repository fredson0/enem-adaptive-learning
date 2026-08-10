"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SimuladoTimerProps = {
  tempoLimiteSegundos: number;
  iniciadoEm: string;
  onExpirado: () => void;
  className?: string;
};

function formatTempo(segundos: number) {
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function SimuladoTimer({
  tempoLimiteSegundos,
  iniciadoEm,
  onExpirado,
  className,
}: SimuladoTimerProps) {
  const [restante, setRestante] = useState(() => {
    const decorrido = Math.floor(
      (Date.now() - new Date(iniciadoEm).getTime()) / 1000,
    );
    return Math.max(tempoLimiteSegundos - decorrido, 0);
  });

  useEffect(() => {
    const tick = () => {
      const decorrido = Math.floor(
        (Date.now() - new Date(iniciadoEm).getTime()) / 1000,
      );
      const next = Math.max(tempoLimiteSegundos - decorrido, 0);
      setRestante(next);
      if (next === 0) {
        onExpirado();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [iniciadoEm, tempoLimiteSegundos, onExpirado]);

  const critico = restante <= 60;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        critico
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-white/15 bg-white/5 text-white/75",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatTempo(restante)}
    </div>
  );
}
