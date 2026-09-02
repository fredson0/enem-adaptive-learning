import { TRILHA_ASSUNTOS } from '../../../../metricas/core/application/helpers/trilha-assuntos.catalog';
import type { MensagemHistorico } from '../ports/ia-engine.port';

export type EscopoMensagem = 'permitido' | 'fora_escopo';

export type MotivoForaEscopo = 'programacao' | 'geral' | 'exfiltracao';

export type AvaliacaoEscopo = {
  escopo: EscopoMensagem;
  motivo?: MotivoForaEscopo;
};

export type OpcoesEscopo = {
  /** Conversa de checklist: respostas do aluno às perguntas do tutor. */
  entrevista?: boolean;
};

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function casa(pattern: RegExp, texto: string): boolean {
  pattern.lastIndex = 0;
  return pattern.test(texto);
}

const ENEM_KEYWORDS =
  /\b(enem|vestibular|simulado|quest[aã]o|questoes|reda[cç][aã]o|matem[aá]tica|linguagens|humanas|natureza|f[ií]sica|qu[ií]mica|biologia|hist[oó]ria|geografia|filosofia|sociologia|literatura|interpreta[cç][aã]o|trilha|prova|gabarito|nota enem|enem\+|treino guiado|lacuna|profici[eê]ncia|cobertura|assunto enem|compet[eê]ncia|disserta[cç][aã]o|cronograma|revis[aã]o|func(ao|oes)|equac(ao|oes)|algebra|geometria|trigonometria|estat[ií]stica|probabilidade|logaritmo|polin[oô]mio|matriz|vetor|angulo|tri[aâ]ngulo|resolver|calcular|exerc[ií]cio|estudar|estudos|rotina|checklist|frac(ao|oes)|porcentagem|razao|proporcao)\b/;

const PLATAFORMA_KEYWORDS =
  /\b(como funciona|plano gratuito|tokens?|tutor ia|progresso|diagn[oó]stico|modalidade|cronometrado|pdf de quest|pdf explicativo)\b/;

const TEMPO_ESTUDO =
  /\b(\d+([.,]\d+)?|uma|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|umas)\s*(h|hrs?|horas?|min(utos?)?)\b/;

const DISPONIBILIDADE_ESTUDO =
  /\b(por\s*(dia|semana)|todos os dias|todo dia|diariamente|semanalmente|fim de semana|finais de semana|\d+\s*(x|vezes)|manha|tarde|noite|disponh|consigo (estudar|dedicar)|tempo (livre|disponivel)|dedic(o|ar)|depois do (trabalho|expediente|almoco))\b/;

const PREFERENCIA_ESTUDO =
  /\b(teoria|teorico|questoes|exercicios|pratica|equilibrio|equilibrad|os dois|as duas|misturad|mais conteudo|mais pratica|videoaula|leitura|tanto faz)\b/;

const META_E_CONTEXTO =
  /\b(essa semana|nesta semana|meta|quero (fazer|passar|acertar|melhorar|revisar)|nenhum(a|o)?|nao tenho|so o enem|prova|vestibular|sisu|fuvest|evento|prazo)\b/;

const NIVEL_OU_DIFICULDADE =
  /\b(iniciante|intermediario|avancado|basico|dificil|facil|nao sei|tenho dificuldade|nao entendo|fraco|perdido|comecar do zero)\b/;

const RESPOSTA_CURTA_CONVERSA =
  /^(sim|nao|n[aã]o|ok|claro|pode ser|isso|exato|certo|iniciante|intermediario|avancado|basico|nenhuma|nenhum|os dois|as duas|tanto faz|mais teoria|mais questoes|equilibrio)[!.?\s]*$/i;

const RESPOSTA_NUMERICA_CURTA =
  /^\d+([.,]\d+)?\s*(h|hrs?|horas?|min(utos?)?|x|vezes?)?$/;

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

function mencionaAssuntoDoEnem(texto: string): boolean {
  const t = texto.trim();
  if (t.length < 4) return false;
  return TRILHA_ASSUNTOS.some((assunto) => {
    const nome = normalizar(assunto.nome);
    if (nome.length < 4) return false;
    return t === nome || t.includes(nome) || nome.includes(t);
  });
}

function temRelacaoComEstudo(texto: string): boolean {
  return (
    casa(ENEM_KEYWORDS, texto) ||
    casa(PLATAFORMA_KEYWORDS, texto) ||
    casa(TEMPO_ESTUDO, texto) ||
    casa(DISPONIBILIDADE_ESTUDO, texto) ||
    casa(PREFERENCIA_ESTUDO, texto) ||
    casa(META_E_CONTEXTO, texto) ||
    casa(NIVEL_OU_DIFICULDADE, texto) ||
    casa(RESPOSTA_NUMERICA_CURTA, texto) ||
    mencionaAssuntoDoEnem(texto)
  );
}

function conversaEmAndamento(
  historico?: Pick<MensagemHistorico, 'role' | 'texto'>[],
): boolean {
  return Boolean(historico?.some((item) => item.role === 'assistant'));
}

function bloqueioRigido(texto: string): AvaliacaoEscopo | null {
  for (const pattern of EXFILTRACAO_OU_JAILBREAK) {
    if (casa(pattern, texto)) {
      return { escopo: 'fora_escopo', motivo: 'exfiltracao' };
    }
  }

  for (const pattern of OFF_TOPIC_PROGRAMACAO) {
    if (casa(pattern, texto)) {
      return { escopo: 'fora_escopo', motivo: 'programacao' };
    }
  }

  return null;
}

export function avaliarEscopoMensagem(
  mensagem: string,
  historico?: Pick<MensagemHistorico, 'role' | 'texto'>[],
  opcoes?: OpcoesEscopo,
): AvaliacaoEscopo {
  const bruto = mensagem.trim();
  const texto = normalizar(bruto);
  if (!texto) return { escopo: 'permitido' };

  const rigido = bloqueioRigido(texto);
  if (rigido) return rigido;

  if (SAUDACAO_CURTA.test(bruto) || RESPOSTA_CURTA_CONVERSA.test(bruto)) {
    return { escopo: 'permitido' };
  }

  if (opcoes?.entrevista) {
    return { escopo: 'permitido' };
  }

  for (const pattern of OFF_TOPIC_GERAL) {
    if (casa(pattern, texto)) {
      return { escopo: 'fora_escopo', motivo: 'geral' };
    }
  }

  if (temRelacaoComEstudo(texto)) {
    return { escopo: 'permitido' };
  }

  if (conversaEmAndamento(historico) && bruto.length <= 500) {
    return { escopo: 'permitido' };
  }

  return { escopo: 'fora_escopo', motivo: 'geral' };
}

export function respostaForaEscopo(motivo?: MotivoForaEscopo): string {
  if (motivo === 'exfiltracao') {
    return `Sou o tutor IA do ENEM+IA e só posso ajudar com estudos para o ENEM — conteúdos das provas, simulados, trilha e seu progresso na plataforma.

Não posso compartilhar dados internos, informações de outros usuários nem detalhes técnicos do sistema. Se quiser, pergunte sobre alguma área do ENEM ou peça um treino de questões.`;
  }

  if (motivo === 'programacao') {
    return `Sou o tutor IA do ENEM+IA e só posso ajudar com estudos para o ENEM — conteúdos das provas, simulados, trilha e dúvidas de Matemática, Linguagens, Humanas e Natureza.

Não consigo ajudar com programação, código ou desenvolvimento de software. Se quiser, posso te ajudar com algum assunto do ENEM ou montar um treino de questões.`;
  }

  return `Sou o tutor IA do ENEM+IA e meu foco é ajudar você a se preparar para o ENEM — dúvidas de conteúdo, simulados, trilha de estudos e orientação de estudo.

Esse assunto está fora do que posso cobrir aqui. Me pergunte sobre alguma área do ENEM, peça um treino de questões ou use a Trilha para ver seu próximo passo.`;
}
