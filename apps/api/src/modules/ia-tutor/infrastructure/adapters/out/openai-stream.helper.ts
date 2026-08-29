export type StreamDeltaHandler = (delta: string) => void | Promise<void>;

export function parseOpenAiSseLine(
  line: string,
): { delta: string } | { done: true } | null {
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
      choices?: { delta?: { content?: string } }[];
    };
    const delta = parsed.choices?.[0]?.delta?.content;
    if (typeof delta === 'string' && delta.length > 0) {
      return { delta };
    }
  } catch {
    return null;
  }

  return null;
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

  let fullText = '';

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
        if (!parsed) {
          continue;
        }
        if ('done' in parsed) {
          continue;
        }
        fullText += parsed.delta;
        await params.onDelta(parsed.delta);
      }
    }

    if (buffer.trim()) {
      const parsed = parseOpenAiSseLine(buffer);
      if (parsed && 'delta' in parsed) {
        fullText += parsed.delta;
        await params.onDelta(parsed.delta);
      }
    }

    const text = fullText.trim();
    if (!text) {
      throw new Error('O tutor não retornou uma resposta. Tente novamente.');
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
