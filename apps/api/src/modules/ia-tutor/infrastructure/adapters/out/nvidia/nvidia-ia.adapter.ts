import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
} from '../../../../core/application/ports/ia-engine.port';
import {
  buildOpenAiChatMessages,
  type OpenAiChatMessage,
} from '../openai-chat.builder';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const TEXT_MODEL_FALLBACKS = [
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'nvidia/nemotron-3-nano-30b-a3b',
] as const;

const VISION_MODEL_FALLBACKS = [
  'meta/llama-3.2-11b-vision-instruct',
  'meta/llama-3.2-90b-vision-instruct',
] as const;

const TEXT_TIMEOUT_MS = 30_000;
const VISION_TIMEOUT_MS = 90_000;

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

  private getModelCandidates(input: EnviarMensagemIaInput): string[] {
    if (input.imagem) {
      const configured = this.config.get<string>('NVIDIA_VISION_MODEL');
      if (!configured) return [...VISION_MODEL_FALLBACKS];
      return [
        configured,
        ...VISION_MODEL_FALLBACKS.filter((model) => model !== configured),
      ];
    }

    const configured = this.config.get<string>('NVIDIA_MODEL');
    if (!configured) return [...TEXT_MODEL_FALLBACKS];
    return [
      configured,
      ...TEXT_MODEL_FALLBACKS.filter((model) => model !== configured),
    ];
  }

  private isRetryableError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('404') ||
      lower.includes('410') ||
      lower.includes('gone') ||
      lower.includes('end of life') ||
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

  private async callModel(
    modelName: string,
    messages: OpenAiChatMessage[],
    timeoutMs: number,
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
          max_tokens: 2048,
          stream: false,
        }),
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => null)) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
        detail?: string;
      } | null;

      if (!response.ok) {
        const detail =
          data?.error?.message ??
          data?.detail ??
          `HTTP ${response.status} da API NVIDIA`;
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
          `Timeout após ${timeoutMs / 1000}s ao chamar ${modelName}`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async enviarMensagem(input: EnviarMensagemIaInput): Promise<string> {
    const messages = buildOpenAiChatMessages(input);
    const candidates = this.getModelCandidates(input);
    const timeoutMs = input.imagem ? VISION_TIMEOUT_MS : TEXT_TIMEOUT_MS;
    let lastError: Error | null = null;

    for (const modelName of candidates) {
      try {
        return await this.callModel(modelName, messages, timeoutMs);
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
        'Verifique NVIDIA_API_KEY e modelos em apps/api/.env'
      }`,
    );
  }
}
