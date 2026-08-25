"use client";

import { Button } from "@/components/ui/button";
import { ApiError, fetchMe } from "@/lib/api";
import { enviarDepoimento, obterMeuDepoimento } from "@/lib/depoimentos";
import { getLoginPath } from "@/lib/login-redirect";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

type TestimonialSubmitPanelProps = {
  totalReais: number;
  totalMocks: number;
  onSubmitted: () => Promise<void>;
};

export function TestimonialSubmitPanel({
  totalReais,
  totalMocks,
  onSubmitted,
}: TestimonialSubmitPanelProps) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [papel, setPapel] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const slotsRestantes = Math.max(totalMocks - totalReais, 0);

  const loadExisting = useCallback(async () => {
    const meu = await obterMeuDepoimento();
    if (meu.depoimento) {
      setTexto(meu.depoimento.texto);
      setPapel(meu.depoimento.papel ?? "");
      setHasExisting(true);
    } else {
      setTexto("");
      setPapel("");
      setHasExisting(false);
    }
  }, []);

  const handleOpen = useCallback(async () => {
    setCheckingAuth(true);
    setError(null);
    setSuccess(false);

    try {
      const user = await fetchMe();
      if (!user) {
        const next = `${window.location.pathname}${window.location.search}#depoimentos`;
        window.location.href = getLoginPath(next);
        return;
      }

      await loadExisting();
      setOpen(true);
    } catch {
      setError("Não foi possível verificar sua sessão. Tente novamente.");
    } finally {
      setCheckingAuth(false);
    }
  }, [loadExisting]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setError(null);
      setSuccess(false);
      setLoading(true);

      try {
        await enviarDepoimento({
          texto: texto.trim(),
          papel: papel.trim() || undefined,
        });
        setSuccess(true);
        await onSubmitted();
        setTimeout(() => setOpen(false), 1200);
      } catch (submitError) {
        const message =
          submitError instanceof ApiError
            ? submitError.message
            : submitError instanceof Error
              ? submitError.message
              : "Não foi possível enviar seu depoimento.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [onSubmitted, papel, texto],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="bg-white px-4 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 text-center">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-black/[0.1] bg-white px-5 text-sm text-[#0b1220] hover:bg-[#fafaf9]"
            onClick={() => void handleOpen()}
            disabled={checkingAuth}
          >
            {checkingAuth ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verificando login...
              </>
            ) : (
              "Deixar meu depoimento"
            )}
          </Button>
          <p className="max-w-md text-xs leading-relaxed text-[#0b1220]/45">
            {totalReais > 0
              ? `${totalReais} depoimento${totalReais === 1 ? "" : "s"} real${totalReais === 1 ? "" : "is"} já ${totalReais === 1 ? "substitui" : "substituem"} ${totalReais === 1 ? "um mock" : "mocks"} na vitrine.`
              : "Os depoimentos atuais são exemplos. Faça login e compartilhe o seu — ele entra na fila e substitui os mocks."}
            {slotsRestantes > 0
              ? ` Faltam ${slotsRestantes} vaga${slotsRestantes === 1 ? "" : "s"} para trocar todos os exemplos.`
              : totalReais >= totalMocks
                ? " Todos os exemplos já foram substituídos por depoimentos reais."
                : null}
          </p>
        </div>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="testimonial-submit-title"
              onClick={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <div className="w-full max-w-lg rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="testimonial-submit-title"
                      className="font-display text-xl font-semibold tracking-[-0.03em] text-[#0b1220]"
                    >
                      {hasExisting ? "Atualizar depoimento" : "Deixar meu depoimento"}
                    </h2>
                    <p className="mt-1 text-sm text-[#0b1220]/55">
                      Conte em poucas linhas como o ENEM+ ajudou nos seus estudos.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Fechar"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1 text-[#0b1220]/45 transition-colors hover:bg-black/[0.04] hover:text-[#0b1220]"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                  <div>
                    <label
                      htmlFor="depoimento-texto"
                      className="mb-2 block text-xs font-medium tracking-wide text-[#0b1220]/60 uppercase"
                    >
                      Seu depoimento
                    </label>
                    <textarea
                      id="depoimento-texto"
                      value={texto}
                      onChange={(event) => setTexto(event.target.value)}
                      rows={5}
                      minLength={20}
                      maxLength={600}
                      required
                      placeholder="Ex.: O tutor IA me ajudou a entender onde eu errava em matemática..."
                      className="w-full resize-none rounded-xl border border-black/[0.08] bg-[#fafaf9] px-4 py-3 text-sm leading-relaxed text-[#0b1220] outline-none transition-colors focus:border-[#7c6cff]/40"
                    />
                    <p className="mt-1 text-right text-xs text-[#0b1220]/35">
                      {texto.length}/600
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="depoimento-papel"
                      className="mb-2 block text-xs font-medium tracking-wide text-[#0b1220]/60 uppercase"
                    >
                      Perfil (opcional)
                    </label>
                    <input
                      id="depoimento-papel"
                      value={papel}
                      onChange={(event) => setPapel(event.target.value)}
                      maxLength={120}
                      placeholder="Ex.: 3º ano — escola pública, SP"
                      className="w-full rounded-xl border border-black/[0.08] bg-[#fafaf9] px-4 py-3 text-sm text-[#0b1220] outline-none transition-colors focus:border-[#7c6cff]/40"
                    />
                  </div>

                  {error ? (
                    <p className="text-sm text-red-600">{error}</p>
                  ) : null}
                  {success ? (
                    <p className="text-sm text-emerald-600">
                      Depoimento enviado! Ele já aparece na vitrine.
                    </p>
                  ) : null}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || texto.trim().length < 20}
                      className={cn(loading && "pointer-events-none")}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Enviando...
                        </>
                      ) : hasExisting ? (
                        "Atualizar depoimento"
                      ) : (
                        "Publicar depoimento"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
