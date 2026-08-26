/**
 * O chat do tutor exibe texto puro (sem renderizador Markdown).
 * Estas regras evitam **, `código`, blocos ``` e tags HTML na resposta ao aluno.
 */
export const REGRAS_FORMATO_RESPOSTA = `
Formato da resposta (OBRIGATÓRIO — o chat NÃO interpreta Markdown):
- Escreva em português brasileiro, como uma conversa clara com o aluno.
- NÃO use asteriscos para negrito (**texto**), itálico (*texto*) nem sublinhado.
- NÃO use crases, blocos de código (\`\`\`) nem formatação de programação.
- NÃO use tags HTML (<b>, <p>, <br>, etc.) nem mencione "tags".
- NÃO use títulos com # ou ##.
- Para ênfase, use palavras normais ou frases curtas — nunca símbolos de formatação.
- Listas: use "1." "2." "3." ou travessões simples (- item), em linhas separadas.
- Fórmulas: escreva em texto (ex.: x², b² - 4ac) — sem LaTeX nem blocos especiais.`;

export const REGRAS_EXPLICAR_ASSUNTO = `
Quando o aluno pedir para EXPLICAR um assunto ("me explica", "o que é", "como funciona", "não entendi"):
1. Definição simples em 1 ou 2 frases (o que é, para que serve).
2. Ideia central com linguagem de ensino médio — evite jargão sem explicar.
3. Exemplo concreto ou analogia do dia a dia.
4. Se for Matemática ou Natureza: mostre o raciocínio passo a passo em texto corrido.
5. Feche com uma dica de como esse tema costuma aparecer no ENEM.
Seja didático e completo — prefira 4 a 6 parágrafos curtos ou uma lista numerada simples.
Não encerre com uma frase vaga; o aluno precisa sair entendendo o conceito.`;

/** Remove Markdown/HTML que o modelo ainda assim possa emitir. */
export function sanitizarRespostaTutor(texto: string): string {
  if (!texto?.trim()) return texto;

  let result = texto;

  // Blocos de código: mantém só o conteúdo
  result = result.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, inner: string) =>
    inner.trim(),
  );

  // Crases inline
  result = result.replace(/`([^`\n]+)`/g, '$1');

  // Negrito/itálico Markdown
  result = result.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  result = result.replace(/__([^_\n]+)__/g, '$1');
  result = result.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '$1');

  // Títulos Markdown
  result = result.replace(/^#{1,6}\s+/gm, '');

  // Tags HTML comuns
  result = result.replace(/<\/?[a-z][^>\n]*>/gi, '');

  // Links Markdown [texto](url) → texto (url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

export function isPedidoExplicacao(mensagem: string): boolean {
  const t = mensagem
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  return (
    /\b(me )?(explica|explique|explical|explicar)\b/.test(t) ||
    /\b(o que e|o que sao|o que significa|como funciona|como se calcula|como resolver)\b/.test(t) ||
    /\b(nao entendi|nao entendo|me ajuda a entender|pode detalhar|detalha)\b/.test(t) ||
    /\b(resume|resumir|me fala sobre|fala sobre)\b/.test(t)
  );
}
