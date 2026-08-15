"use client";

import type { TutorChatSession } from "@/components/workspace/tutor-session-provider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MenuPosition = {
  top: number;
  left: number;
};

type ChatListItemProps = {
  chat: TutorChatSession;
  active: boolean;
  pinned: boolean;
  preview: string | null;
  onOpen: () => void;
  onPin: () => void;
  onRename: (titulo: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

const MENU_WIDTH = 168;
const MENU_APPROX_HEIGHT = 132;

export function ChatListItem({
  chat,
  active,
  pinned,
  preview,
  onOpen,
  onPin,
  onRename,
  onDelete,
}: ChatListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(chat.title);
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftTitle(chat.title);
  }, [chat.title]);

  useEffect(() => {
    if (!renaming) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [renaming]);

  const updateMenuPosition = useCallback(() => {
    const button = menuButtonRef.current;
    if (!button) return null;

    const rect = button.getBoundingClientRect();
    const margin = 8;

    let left = rect.right - MENU_WIDTH;
    let top = rect.bottom + 6;

    if (left < margin) {
      left = margin;
    }

    if (left + MENU_WIDTH > window.innerWidth - margin) {
      left = window.innerWidth - MENU_WIDTH - margin;
    }

    if (top + MENU_APPROX_HEIGHT > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - MENU_APPROX_HEIGHT - 6);
    }

    const position = { top, left };
    setMenuPosition(position);
    return position;
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setRenaming(false);
        setDraftTitle(chat.title);
      }
    };

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, chat.title, updateMenuPosition]);

  const commitRename = async () => {
    const titulo = draftTitle.trim();
    setRenaming(false);
    if (!titulo || titulo === chat.title) {
      setDraftTitle(chat.title);
      return;
    }
    await onRename(titulo);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const menu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {menuOpen && menuPosition ? (
          <motion.div
            key="chat-item-menu"
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="fixed z-[120] min-w-[168px] overflow-hidden rounded-xl border border-white/10 bg-[#262626] p-1 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                onPin();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/8"
            >
              {pinned ? (
                <PinOff className="size-4 text-white/55" strokeWidth={1.75} />
              ) : (
                <Pin className="size-4 text-white/55" strokeWidth={1.75} />
              )}
              {pinned ? "Desafixar" : "Fixar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setRenaming(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/8"
            >
              <Pencil className="size-4 text-white/55" strokeWidth={1.75} />
              Renomear
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
              Excluir
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "group flex w-full items-start gap-1 rounded-[6px] pr-1 transition-all duration-300",
          active
            ? "bg-[var(--osmo-active)] ring-1 ring-white/10"
            : "hover:bg-[var(--osmo-hover)]",
        )}
      >
        <button
          type="button"
          onClick={onOpen}
          disabled={deleting}
          className={cn(
            "min-w-0 flex-1 px-3 py-2.5 text-left transition-colors",
            active ? "text-white" : "text-white/60 group-hover:text-white",
            deleting && "opacity-50",
          )}
        >
          {renaming ? (
            <input
              ref={inputRef}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={() => void commitRename()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void commitRename();
                }
              }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded bg-black/25 px-2 py-1 text-sm text-white outline-none ring-1 ring-white/15"
            />
          ) : (
            <>
              <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                {pinned ? (
                  <Pin
                    className="size-3 shrink-0 text-[#b0ff57]/80"
                    strokeWidth={2}
                  />
                ) : null}
                <span className="truncate">{chat.title}</span>
              </p>
              {preview ? (
                <p className="mt-0.5 truncate text-xs text-white/40">
                  {preview}
                </p>
              ) : null}
            </>
          )}
        </button>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Opções da conversa"
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            if (menuOpen) {
              setMenuOpen(false);
              return;
            }
            updateMenuPosition();
            setMenuOpen(true);
          }}
          className={cn(
            "mt-1.5 flex size-7 shrink-0 items-center justify-center rounded-md text-white/45 transition",
            "opacity-100 lg:opacity-0",
            (hovered || menuOpen || active) && "lg:opacity-100",
            "hover:bg-white/10 hover:text-white/80",
          )}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {menu}
    </div>
  );
}

export function getChatPreview(chat: TutorChatSession): string | null {
  const preview =
    chat.preview?.trim() ||
    chat.messages.find((message) => message.role === "assistant")?.texto?.trim() ||
    "";

  if (!preview || preview.toLowerCase() === "sem mensagens") return null;

  const title = chat.title.trim().toLowerCase();
  const normalized = preview.toLowerCase();

  if (title === normalized) return null;
  if (title.startsWith(normalized.slice(0, 28))) return null;
  if (normalized.startsWith(title.slice(0, 28))) return null;

  return preview;
}
