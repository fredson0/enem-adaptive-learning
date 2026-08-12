export const TRILHA_ATUALIZADA_EVENT = "trilha-atualizada";

export function emitirTrilhaAtualizada() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TRILHA_ATUALIZADA_EVENT));
  }
}

export function usarTrilhaAtualizada(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(TRILHA_ATUALIZADA_EVENT, callback);
  return () => window.removeEventListener(TRILHA_ATUALIZADA_EVENT, callback);
}
