import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildTutorSystemPrompt } from '../../../../core/application/helpers/tutor-prompts';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
} from '../../../../core/application/ports/ia-engine.port';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const MODEL_FALLBACKS = [
  'meta/llama-3.1-8b-instruct',
  'meta/llama-3.1-70b-instruct',
  'meta/llama-3.3-70b-instruct',
] as const;

const REQUEST_TIMEOUT_MS = 30_000;

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class NvidiaIaAdapter implements IaEnginePort {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private getApiKey(): string {
    const apiKey = this.config.get<string>('NVIDIA_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'NVIDIA_API_KEY não configurada em apps/api/.env',
      );
    }
    return apiKey;
  }

  private getModelCandidates(): string[] {
    const configured = this.config.get<string>('NVIDIA_MODEL');
    if (!configured) {
      return [...MODEL_FALLBACKS];
    }

    return [
      configured,
      ...MODEL_FALLBACKS.filter((model) => model !== configured),
    ];
  }

  private isRetryableError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('404') ||
      lower.includes('not found') ||
      lower.includes('fetch failed') ||
      lower.includes('econnreset') ||
      lower.includes('etimedout') ||
      lower.includes('socket hang up') ||
      lower.includes('timeout') ||
      lower.includes('abort') ||
      lower.includes('503') ||
      lower.includes('502') ||
      lower.includes('500')
    );
  }

  private buildMessages(input: EnviarMensagemIaInput): ChatMessage[] {
    return [
      {
        role: 'system',
        content: buildTutorSystemPrompt(
          input.nivelAluno,
          input.contextoMetricas,
        ),
      },
      ...(input.historico ?? []).map((msg) => ({
        role: (msg.role === 'assistant' ? 'assistant' : 'user') as
          | 'assistant'
          | 'user',
        content: msg.texto,
      })),
      { role: 'user', content: input.texto },
    ];
  }

  private async callModel(
    modelName: string,
    messages: ChatMessage[],
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(NVIDIA_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024,
          stream: false,
        }),
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => null)) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      } | null;

      if (!response.ok) {
        const detail =
          data?.error?.message ?? `HTTP ${response.status} da API NVIDIA`;
        throw new Error(detail);
      }

      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new ServiceUnavailableException(
          'O tutor não retornou uma resposta. Tente novamente.',
        );
      }

      return text;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `Timeout após ${REQUEST_TIMEOUT_MS / 1000}s ao chamar ${modelName}`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async enviarMensagem(input: EnviarMensagemIaInput): Promise<string> {
    const messages = this.buildMessages(input);
    const candidates = this.getModelCandidates();
    let lastError: Error | null = null;

    for (const modelName of candidates) {
      try {
        return await this.callModel(modelName, messages);
      } catch (error) {
        if (error instanceof ServiceUnavailableException) {
          throw error;
        }

        const message =
          error instanceof Error ? error.message : 'Erro desconhecido';

        if (this.isRetryableError(message)) {
          lastError = error instanceof Error ? error : new Error(message);
          continue;
        }

        if (message.includes('429') || message.toLowerCase().includes('rate')) {
          throw new ServiceUnavailableException(
            'Limite da API NVIDIA atingido. Tente novamente em alguns minutos.',
          );
        }

        throw new ServiceUnavailableException(
          `Falha ao consultar o tutor IA (NVIDIA): ${message}`,
        );
      }
    }

    throw new ServiceUnavailableException(
      `Não foi possível conectar à API NVIDIA: ${
        lastError?.message ??
        'Verifique NVIDIA_API_KEY e NVIDIA_MODEL em apps/api/.env'
      }`,
    );
  }
}
