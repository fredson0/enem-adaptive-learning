/** Rota única do tutor — sessões ficam no client (sessionStorage). */
export const TUTOR_CHAT_PATH = "/tutor";

export function isNewTutorChatPath(pathname: string) {
  return pathname === TUTOR_CHAT_PATH;
}
