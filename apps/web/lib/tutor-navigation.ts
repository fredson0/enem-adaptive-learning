/** Rota para iniciar um chat novo no tutor (força remount do painel). */
export function getNewTutorChatPath() {
  return `/tutor?r=${Date.now()}`;
}

export function isNewTutorChatPath(pathname: string) {
  return pathname === "/tutor";
}
