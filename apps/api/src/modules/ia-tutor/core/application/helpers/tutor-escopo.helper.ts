export type EscopoMensagem = 'permitido' | 'fora_escopo';

export type MotivoForaEscopo =
  | 'programacao'
  | 'geral'
  | 'exfiltracao';

export type AvaliacaoEscopo = {
  escopo: EscopoMensagem;
  motivo?: MotivoForaEscopo;
};

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

const ENEM_KEYWORDS =
  /\b(enem|vestibular|simulado|quest[aã]o|reda[cç][aã]o|matem[aá]tica|linguagens|humanas|natureza|f[ií]sica|qu[ií]mica|biologia|hist[oó]ria|geografia|filosofia|sociologia|literatura|interpreta[cç][aã]o|trilha|prova|gabarito|nota enem|enem\+|treino guiado|lacuna|profici[eê]ncia|cobertura|assunto enem|compet[eê]ncia|disserta[cç][aã]o|cronograma|revis[aã]o|func[aã]o|equa[cç][aã]o|algebra|geometria|trigonometria|estat[ií]stica|probabilidade|logaritmo|polin[oô]mio|matriz|vetor|angulo|tri[aâ]ngulo|resolver|calcular|exerc[ií]cio)\b/;

const PLATAFORMA_KEYWORDS =
  /\b(como funciona|plano gratuito|tokens?|tutor ia|progresso|diagn[oó]stico|modalidade|cronometrado|pdf de quest|pdf explicativo)\b/;

const SAUDACAO_CURTA =
  /^(oi|ola|olá|hey|e aí|eai|bom dia|boa tarde|boa noite|ajuda|obrigad|valeu|tudo bem|td bem)[!.?\s]*$/i;

const OFF_TOPIC_PROGRAMACAO = [
  /\b(javascript|typescript|python|java\b|c\+\+|c#|react|node\.?js|next\.?js|nestjs|docker|kubernetes|git\b|github|mongodb|postgres|programa[cç][aã]o|programar|c[oó]digo|codar|api rest|backend|frontend|full[\s-]?stack|html|css|vari[aá]vel|debug|compilador|vscode|leetcode|hackerrank)\b/,
  /\b(como criar (um )?(app|site|aplicativo|sistema|bot|programa))\b/,
  /\b(me ajuda com (meu )?c[oó]digo|corrige (meu )?c[oó]digo|bug no c[oó]digo)\b/,
  /\b(fun[cç][aã]o em python|loop em javascript|array em java)\b/,
  /\b(sql injection|orm prisma|banco de dados relacional)\b/,
];

const OFF_TOPIC_GERAL = [
  /\b(receita de|como cozinhar|futebol|novela|big brother|hor[oó]scopo|piada|meme)\b/,
];

const EXFILTRACAO_OU_JAILBREAK = [
  /\b(ignore|esque[cç]a|desconsidere) (as )?(instru[cç][oõ]es|regras) (anteriores|do sistema)\b/,
  /\b(system prompt|prompt do sistema|prompt interno|instru[cç][oõ]es do sistema)\b/,
  /\b(revele?|mostre?|liste?|dump|exporte?) (o |os |as )?(usu[aá]rios|alunos|emails?|senhas?|tokens? jwt|credenciais|dados (de|dos) (outros|alunos)|banco de dados|tabela|schema|sql)\b/,
  /\b(dados de outro|email de outro|senha de outro|lista de usu[aá]rios|todos os usu[aá]rios)\b/,
  /\b(jailbreak|dan mode|modo desenvolvedor|bypass|ignore previous)\b/,
  /\b(select \* from|drop table|union select)\b/,
];

function temRelacaoComEstudo(texto: string): boolean {
  return ENEM_KEYWORDS.test(texto) || PLATAFORMA_KEYWORDS.test(texto);
}

export function avaliarEscopoMensagem(mensagem: string): AvaliacaoEscopo {
  const bruto = mensagem.trim();
  const texto = normalizar(bruto);
  if (!texto) return { escopo: 'permitido' };

  for (const pattern of EXFILTRACAO_OU_JAILBREAK) {
    if (pattern.test(texto)) {
      return { escopo: 'fora_escopo', motivo: 'exfiltracao' };
    }
  }

  if (SAUDACAO_CURTA.test(bruto)) {
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

  if (temRelacaoComEstudo(texto)) {
    return { escopo: 'permitido' };
  }

  return { escopo: 'fora_escopo', motivo: 'geral' };
}

export function respostaForaEscopo(motivo?: MotivoForaEscopo): string {
  if (motivo === 'exfiltracao') {
    return `Sou o tutor IA do ENEM+ e só posso ajudar com estudos para o ENEM — conteúdos das provas, simulados, trilha e seu progresso na plataforma.

Não posso compartilhar dados internos, informações de outros usuários nem detalhes técnicos do sistema. Se quiser, pergunte sobre alguma área do ENEM ou peça um treino de questões.`;
  }

  if (motivo === 'programacao') {
    return `Sou o tutor IA do ENEM+ e só posso ajudar com estudos para o ENEM — conteúdos das provas, simulados, trilha e dúvidas de Matemática, Linguagens, Humanas e Natureza.

Não consigo ajudar com programação, código ou desenvolvimento de software. Se quiser, posso te ajudar com algum assunto do ENEM ou montar um treino de questões.`;
  }

  return `Sou o tutor IA do ENEM+ e meu foco é ajudar você a se preparar para o ENEM — dúvidas de conteúdo, simulados, trilha de estudos e orientação de estudo.

Esse assunto está fora do que posso cobrir aqui. Me pergunte sobre alguma área do ENEM, peça um treino de questões ou use a Trilha para ver seu próximo passo.`;
}
