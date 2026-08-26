"use client";

import { cn } from "@/lib/utils";
import {
  ArrowUp,
  Maximize2,
  Minimize2,
  Plus,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

const DOCKED_MIN_HEIGHT = 52;
const DOCKED_MAX_HEIGHT = 280;
const HERO_MIN_HEIGHT = 128;
const HERO_MAX_HEIGHT = 280;
const MOBILE_DOCKED_MIN_HEIGHT = 44;
const MOBILE_DOCKED_MAX_HEIGHT = 160;
const MOBILE_HERO_MIN_HEIGHT = 72;
const MOBILE_HERO_MAX_HEIGHT = 120;

export type TutorPromptInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, attachment?: File) => void;
  placeholder?: string;
  loading?: boolean;
  docked?: boolean;
  buttonText?: string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onLayoutChange?: () => void;
};

export function TutorPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Me explica",
  loading = false,
  docked = false,
  buttonText = "Enviar",
  textareaRef: externalTextareaRef,
  onLayoutChange,
}: TutorPromptInputProps) {
  const inputId = useId();
  const fileInputId = `${inputId}-file`;
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef ?? internalTextareaRef;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null,
  );
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const syncCompact = () => setIsCompact(mediaQuery.matches);
    syncCompact();
    mediaQuery.addEventListener("change", syncCompact);
    return () => mediaQuery.removeEventListener("change", syncCompact);
  }, []);

  const minHeight = docked
    ? isCompact
      ? MOBILE_DOCKED_MIN_HEIGHT
      : DOCKED_MIN_HEIGHT
    : isCompact
      ? MOBILE_HERO_MIN_HEIGHT
      : HERO_MIN_HEIGHT;
  const maxHeight = docked
    ? isCompact
      ? MOBILE_DOCKED_MAX_HEIGHT
      : DOCKED_MAX_HEIGHT
    : isCompact
      ? MOBILE_HERO_MAX_HEIGHT
      : HERO_MAX_HEIGHT;
  const placeholderHeight = docked
    ? isCompact
      ? 84
      : 108
    : isCompact
      ? 108
      : 196;

  useEffect(() => {
    setMounted(true);
  }, []);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || fullscreen) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    );
    textarea.style.height = `${nextHeight}px`;
    onLayoutChange?.();
  }, [fullscreen, maxHeight, minHeight, onLayoutChange, textareaRef]);

  useEffect(() => {
    adjustHeight();
  }, [value, docked, fullscreen, adjustHeight]);

  useEffect(() => {
    if (!attachment) {
      setAttachmentPreview(null);
      return;
    }

    const url = URL.createObjectURL(attachment);
    setAttachmentPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  useEffect(() => {
    if (!fullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen, textareaRef]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed, attachment ?? undefined);
    onChange("");
    setAttachment(null);
    if (fullscreen) setFullscreen(false);
    requestAnimationFrame(adjustHeight);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }

    if (event.key === "Escape" && fullscreen) {
      event.preventDefault();
      setFullscreen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return;
    setAttachment(file);
    event.target.value = "";
  };

  const removeAttachment = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeFullscreen = () => {
    setFullscreen(false);
    requestAnimationFrame(() => {
      adjustHeight();
      textareaRef.current?.focus();
    });
  };

  const promptField = (expanded: boolean) => (
    <div
      className={cn(
        "relative rounded-2xl border border-[var(--osmo-border)] bg-[var(--osmo-card)]",
        "shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]",
        expanded && "flex min-h-0 flex-1 flex-col",
      )}
    >
      <button
        type="button"
        onClick={() =>
          expanded ? closeFullscreen() : setFullscreen(true)
        }
        className="absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white/80 sm:top-2.5 sm:right-2.5 sm:h-8 sm:w-8"
        aria-label={expanded ? "Sair da tela cheia" : "Abrir em tela cheia"}
        title={expanded ? "Sair da tela cheia" : "Tela cheia"}
      >
        {expanded ? (
          <Minimize2 className="size-4" strokeWidth={1.75} />
        ) : (
          <Maximize2 className="size-4" strokeWidth={1.75} />
        )}
      </button>

      {attachmentPreview && (
        <div className="relative z-20 px-3 pt-3">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachmentPreview}
              alt="Anexo"
              className="h-16 w-16 rounded-xl border border-white/10 object-cover"
            />
            <button
              type="button"
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 z-30 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1c1c1c] text-white ring-1 ring-white/20 transition-colors hover:bg-[#2a2a2a]"
              aria-label="Remover imagem"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        data-lenis-prevent
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        rows={expanded ? 12 : 1}
        style={
          expanded
            ? { minHeight: "min(60vh, 520px)", scrollBehavior: "smooth" }
            : { scrollBehavior: "smooth" }
        }
        className={cn(
          "w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed text-osmo outline-none placeholder:text-osmo-subtle sm:px-4 sm:py-3.5 sm:text-[15px]",
          "overflow-y-auto disabled:cursor-not-allowed disabled:opacity-60 tutor-prompt-scroll",
          expanded ? "min-h-0 flex-1 pr-10 pt-3 sm:pr-12 sm:pt-4" : "pr-10 sm:pr-12",
        )}
      />

      <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            id={expanded ? `${fileInputId}-expanded` : fileInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
          <label
            htmlFor={expanded ? `${fileInputId}-expanded` : fileInputId}
            className={cn(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white sm:h-9 sm:w-9",
              loading && "pointer-events-none opacity-50",
            )}
            title="Enviar foto"
            aria-label="Enviar foto"
          >
            <Plus className="size-5" strokeWidth={1.75} />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          aria-label={buttonText}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1f3dbc] text-white transition-colors hover:bg-[#2848d4] disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
        >
          <ArrowUp className="size-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );

  const fullscreenOverlay =
    mounted &&
    createPortal(
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm md:p-8"
        role="dialog"
        aria-modal="true"
        aria-label="Editar mensagem em tela cheia"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeFullscreen();
        }}
      >
        <div className="flex h-full w-full max-w-3xl flex-col">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-sm font-medium text-white/70">Editar mensagem</p>
            <button
              type="button"
              onClick={closeFullscreen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-[2px]">
            {promptField(true)}
          </div>

          <p className="mt-3 text-center text-xs text-white/35">
            Enter envia · Shift+Enter quebra linha · Esc fecha
          </p>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <div className="relative w-full sm:w-[720px]">
        {fullscreen ? (
          <div
            aria-hidden
            className="rounded-2xl border border-transparent p-[2px]"
            style={{ minHeight: placeholderHeight }}
          />
        ) : (
          <div className="relative rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-[2px]">
            {promptField(false)}
          </div>
        )}

        {docked && !fullscreen && (
          <p className="mt-2 text-center text-[11px] text-white/30">
            Enter envia · Shift+Enter nova linha
          </p>
        )}
      </div>

      {fullscreen && fullscreenOverlay}
    </>
  );
}
