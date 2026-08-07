import type { MensagemHistorico } from '../ports/ia-engine.port';

export function buildConversaTitulo(mensagens: MensagemHistorico[]): string {
  const firstUser = mensagens.find((message) => message.role === 'user');
  if (!firstUser) return 'Nova conversa';

  const text = firstUser.texto.trim();
  if (!text) return 'Nova conversa';
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}
