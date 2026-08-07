/** Rota única do tutor — conversas persistidas na API (`GET /ia-tutor/conversas`). */
export const TUTOR_CHAT_PATH = "/tutor";

export function isNewTutorChatPath(pathname: string) {
  return pathname === TUTOR_CHAT_PATH;
}
