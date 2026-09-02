export type StreamDeltaHandler = (delta: string) => void | Promise<void>;

export type ParsedOpenAiSseLine =
  | { done: true }
  | { contentDelta?: string; reasoningDelta?: string };

type OpenAiStreamDelta = {
  content?: string | null;
  reasoning_content?: string | null;
  reasoning?: string | null;
};

/** GPT-OSS / Nemotron colocam o raciocínio em tags <think> ou em reasoning_content. */
export function stripThinkTags(texto: string): string {
  if (!texto?.trim()) return '';

  let result = texto;
  if (result.includes('</think>')) {
    result = result.split('</think>').pop() ?? result;
  }
  result = result.replace(/<think>[\s\S]*?<\/think>/gi, '');
  return result.trim();
}

export function parseOpenAiSseLine(line: string): ParsedOpenAiSseLine | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) {
    return null;
  }

  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') {
    return { done: true };
  }

  try {
    const parsed = JSON.parse(payload) as {
      choices?: { delta?: OpenAiStreamDelta }[];
    };
    const delta = parsed.choices?.[0]?.delta;
    const content =
      typeof delta?.content === 'string' && delta.content.length > 0
        ? delta.content
        : undefined;
    const reasoningRaw =
      (typeof delta?.reasoning_content === 'string' &&
      delta.reasoning_content.length > 0
        ? delta.reasoning_content
        : undefined) ??
      (typeof delta?.reasoning === 'string' && delta.reasoning.length > 0
        ? delta.reasoning
        : undefined);

    if (!content && !reasoningRaw) {
      return null;
    }

    return {
      ...(content ? { contentDelta: content } : {}),
      ...(reasoningRaw ? { reasoningDelta: reasoningRaw } : {}),
    };
  } catch {
    return null;
  }
}

export async function streamOpenAiChatCompletion(params: {
  url: string;
  apiKey: string;
  body: Record<string, unknown>;
  timeoutMs: number;
  onDelta: StreamDeltaHandler;
  signal?: AbortSignal;
}): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  const onAbort = () => controller.abort();
  params.signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(params.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({ ...params.body, stream: true }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: { message?: string };
        detail?: string;
      } | null;
      const detail =
        data?.error?.message ??
        data?.detail ??
        `HTTP ${response.status} da API de IA`;
      throw new Error(detail);
    }

    if (!response.body) {
      throw new Error('Resposta de streaming sem corpo');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let contentText = '';
    let reasoningText = '';

    const applyParsed = async (parsed: ParsedOpenAiSseLine) => {
      if ('done' in parsed) {
        return;
      }
      if (parsed.contentDelta) {
        contentText += parsed.contentDelta;
        await params.onDelta(parsed.contentDelta);
      }
      if (parsed.reasoningDelta) {
        reasoningText += parsed.reasoningDelta;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const parsed = parseOpenAiSseLine(line);
        if (parsed) {
          await applyParsed(parsed);
        }
      }
    }

    if (buffer.trim()) {
      const parsed = parseOpenAiSseLine(buffer);
      if (parsed) {
        await applyParsed(parsed);
      }
    }

    const visible = stripThinkTags(contentText);
    const fallback = stripThinkTags(reasoningText);
    const text = visible || fallback;
    if (!text) {
      throw new Error('O tutor não retornou uma resposta. Tente novamente.');
    }

    // gpt-oss às vezes só emite reasoning_content — empurra o texto limpo de uma vez
    if (!visible) {
      await params.onDelta(text);
    }

    return text;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Timeout após ${params.timeoutMs / 1000}s ao chamar a API de IA`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    params.signal?.removeEventListener('abort', onAbort);
  }
}
