export type IntencaoTutor =
  | 'chat_livre'
  | 'gerar_simulado'
  | 'frequencia_temas'
  | 'produto_plataforma';

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function classificarIntencaoTutor(mensagem: string): IntencaoTutor {
  const t = normalizar(mensagem);

  if (
    /\b(gerar simulado|montar simulado|criar simulado|fazer simulado|simulado com ia)\b/.test(
      t,
    ) ||
    /\b(quero|preciso|me (da|d[aá])|monta|gera|faz)\s+\d+\s+quest/.test(t) ||
    /\b(treino de|treino com)\s+\d+\s+quest/.test(t)
  ) {
    return 'gerar_simulado';
  }

  if (
    /\b(o que mais cai|assuntos? mais (cobrad|frequ)|frequencia de|temas? mais comuns|o que cai no enem|mais cobrado no enem|estatistica do banco)\b/.test(
      t,
    )
  ) {
    return 'frequencia_temas';
  }

  if (
    /\b(como funciona|como usar|quantos tokens|tokens ia|plano gratuito|plano apoio|o que e a trilha|como funciona a trilha|pdf explicativo|pdf de questoes|priorizar questoes)\b/.test(
      t,
    )
  ) {
    return 'produto_plataforma';
  }

  return 'chat_livre';
}
