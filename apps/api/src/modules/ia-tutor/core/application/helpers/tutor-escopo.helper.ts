export type EscopoMensagem = 'permitido' | 'fora_escopo';

export type AvaliacaoEscopo = {
  escopo: EscopoMensagem;
  motivo?: 'programacao' | 'geral';
};

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

const ENEM_KEYWORDS =
  /\b(enem|vestibular|simulado|quest[aã]o|reda[cç][aã]o|matem[aá]tica|linguagens|humanas|natureza|f[ií]sica|qu[ií]mica|biologia|hist[oó]ria|geografia|filosofia|sociologia|literatura|interpreta[cç][aã]o|trilha|prova|gabarito|nota enem|enem\+|treino guiado|lacuna|profici[eê]ncia|cobertura|assunto enem|compet[eê]ncia)\b/;

const OFF_TOPIC_PROGRAMACAO = [
  /\b(javascript|typescript|python|java\b|c\+\+|c#|react|node\.?js|next\.?js|nestjs|docker|kubernetes|git\b|github|mongodb|postgres|programa[cç][aã]o|programar|c[oó]digo|codar|api rest|backend|frontend|full[\s-]?stack|html|css|vari[aá]vel|debug|compilador|vscode|leetcode|hackerrank)\b/,
  /\b(como criar (um )?(app|site|aplicativo|sistema|bot|programa))\b/,
  /\b(me ajuda com (meu )?c[oó]digo|corrige (meu )?c[oó]digo|bug no c[oó]digo)\b/,
  /\b(fun[cç][aã]o em python|loop em javascript|array em java)\b/,
  /\b(sql injection|orm prisma|banco de dados relacional)\b/,
];

const OFF_TOPIC_GERAL = [
  /\b(receita de|como cozinhar|futebol|novela|big brother|hor[oó]scopo)\b/,
];

export function avaliarEscopoMensagem(mensagem: string): AvaliacaoEscopo {
  const texto = normalizar(mensagem.trim());
  if (!texto) return { escopo: 'permitido' };

  if (ENEM_KEYWORDS.test(texto)) {
    return { escopo: 'permitido' };
  }

  for (const pattern of OFF_TOPIC_PROGRAMACAO) {
    if (pattern.test(texto)) {
      return { escopo: 'fora_escopo', motivo: 'programacao' };
    }
  }

  for (const pattern of OFF_TOPIC_GERAL) {
    if (pattern.test(texto)) {
      return { escopo: 'fora_escopo', motivo: 'geral' };
    }
  }

  return { escopo: 'permitido' };
}

export function respostaForaEscopo(motivo?: AvaliacaoEscopo['motivo']): string {
  if (motivo === 'programacao') {
    return `Sou o tutor IA do ENEM+ e só posso ajudar com estudos para o ENEM — conteúdos das provas, simulados, trilha e dúvidas de Matemática, Linguagens, Humanas e Natureza.

Não consigo ajudar com programação, código ou desenvolvimento de software. Se quiser, posso te ajudar com algum assunto do ENEM ou montar um treino de questões.`;
  }

  return `Sou o tutor IA do ENEM+ e meu foco é ajudar você a se preparar para o ENEM — dúvidas de conteúdo, simulados, trilha de estudos e orientação de estudo.

Esse assunto está fora do que posso cobrir aqui. Me pergunte sobre alguma área do ENEM, peça um treino de questões ou use a Trilha para ver seu próximo passo.`;
}
