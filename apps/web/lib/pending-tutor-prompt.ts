const STORAGE_KEY = "enem-pending-tutor-prompt";

export function savePendingTutorPrompt(message: string) {
  if (typeof window === "undefined") return;
  const trimmed = message.trim();
  if (!trimmed) return;
  sessionStorage.setItem(STORAGE_KEY, trimmed);
}

export function consumePendingTutorPrompt(): string | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(STORAGE_KEY);
  if (!value) return null;
  sessionStorage.removeItem(STORAGE_KEY);
  return value;
}

export function peekPendingTutorPrompt(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}
