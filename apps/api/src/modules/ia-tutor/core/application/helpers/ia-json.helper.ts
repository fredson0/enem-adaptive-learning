/**
 * Extração e correção de JSON retornado por modelos de IA.
 * Usa contagem de chaves (não regex greedy) + response_format nos adapters quando possível.
 */

export function limparMarkdownJson(texto: string): string {
  return texto
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();
}

/** Corrige JSON malformado comum em respostas de LLM. */
export function corrigirJsonIa(json: string): string {
  let fixed = limparMarkdownJson(json);

  fixed = fixed.replace(/,\s*([}\]])/g, '$1');
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  const valoresString = ['matematica', 'linguagens', 'humanas', 'natureza'];
  for (const valor of valoresString) {
    fixed = fixed.replace(
      new RegExp(`:\\s*${valor}\\s*([,}])`, 'gi'),
      `: "${valor}"$1`,
    );
  }

  fixed = fixed.replace(
    /:\s*([a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ0-9_\s-]*?)\s*([,}\]])/g,
    (full, value, end) => {
      const trimmed = String(value).trim();
      if (['null', 'true', 'false'].includes(trimmed)) {
        return `: ${trimmed}${end}`;
      }
      if (/^\d+(\.\d+)?$/.test(trimmed)) {
        return `: ${trimmed}${end}`;
      }
      if (trimmed.startsWith('"') || trimmed.startsWith('[')) {
        return full;
      }
      return `: "${trimmed.replace(/"/g, '\\"')}"${end}`;
    },
  );

  return fixed;
}

/** Localiza o primeiro objeto `{...}` balanceado, respeitando strings escapadas. */
export function extrairPrimeiroObjetoJson(texto: string): string | null {
  const cleaned = limparMarkdownJson(texto);
  const start = cleaned.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return cleaned.slice(start, i + 1);
      }
    }
  }

  return null;
}

/** Tenta parsear JSON da resposta da IA (raw + corrigido). */
export function parseJsonIa<T extends Record<string, unknown>>(
  texto: string,
): T | null {
  const raw = extrairPrimeiroObjetoJson(texto);
  if (!raw) return null;

  const candidatos = [raw, corrigirJsonIa(raw)];

  for (const candidato of candidatos) {
    try {
      const parsed = JSON.parse(candidato) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as T;
      }
    } catch {
      // tenta próximo candidato
    }
  }

  return null;
}
