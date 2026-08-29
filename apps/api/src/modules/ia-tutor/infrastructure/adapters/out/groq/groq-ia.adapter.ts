import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
  IaStreamDeltaHandler,
} from '../../../../core/application/ports/ia-engine.port';
import {
  buildOpenAiChatMessages,
  type OpenAiChatMessage,
} from '../openai-chat.builder';
import {
  montarCandidatosModelo,
  resolverModelTier,
} from '../../../../core/application/helpers/ia-model-tier.helper';
import { streamOpenAiChatCompletion } from '../openai-stream.helper';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

const TEXT_MODEL_FALLBACKS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
] as const;

const VISION_MODEL_FALLBACKS = [
  'llama-3.2-11b-vision-preview',
  'llama-3.2-90b-vision-preview',
] as const;

const TEXT_TIMEOUT_MS = 30_000;
const VISION_TIMEOUT_MS = 60_000;

@Injectable()
export class GroqIaAdapter implements IaEnginePort {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private getApiKey(): string {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GROQ_API_KEY não configurada em apps/api/.env',
      );
    }
    return apiKey;
  }

  private getModelCandidates(input: EnviarMensagemIaInput): string[] {
    if (input.imagem) {
      const configured = this.config.get<string>('GROQ_VISION_MODEL');
      if (!configured) return [...VISION_MODEL_FALLBACKS];
      return [
        configured,
        ...VISION_MODEL_FALLBACKS.filter((model) => model !== configured),
      ];
    }

    const tier = resolverModelTier(input);

    return montarCandidatosModelo({
      tier,
      configuredDefault: this.config.get<string>('GROQ_MODEL'),
      configuredExatas: this.config.get<string>('GROQ_MODEL_EXATAS'),
      fallbacks: TEXT_MODEL_FALLBACKS,
    });
  }

  private isRetryableError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('404') ||
      lower.includes('not found') ||
      lower.includes('fetch failed') ||
      lower.includes('timeout') ||
      lower.includes('abort') ||
      lower.includes('503') ||
      lower.includes('502') ||
      lower.includes('500')
    );
  }

  private buildRequestBody(
    modelName: string,
    messages: OpenAiChatMessage[],
    jsonMode: boolean,
    stream: boolean,
  ) {
    return {
      model: modelName,
      messages,
      temperature: jsonMode ? 0.2 : 0.7,
      top_p: 0.9,
      max_tokens: 2048,
      stream,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };
  }

  private async callModelStream(
    modelName: string,
    messages: OpenAiChatMessage[],
    timeoutMs: number,
    jsonMode: boolean,
    onDelta: IaStreamDeltaHandler,
  ): Promise<string> {
    if (jsonMode) {
      const text = await this.callModel(modelName, messages, timeoutMs, jsonMode);
      await onDelta(text);
      return text;
    }

    return streamOpenAiChatCompletion({
      url: GROQ_BASE_URL,
      apiKey: this.getApiKey(),
      body: this.buildRequestBody(modelName, messages, jsonMode, true),
      timeoutMs,
      onDelta,
    });
  }

  private async callModel(
    modelName: string,
    messages: OpenAiChatMessage[],
    timeoutMs: number,
    jsonMode: boolean,
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(GROQ_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify(
          this.buildRequestBody(modelName, messages, jsonMode, false),
        ),
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => null)) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      } | null;

      if (!response.ok) {
        const detail =
          data?.error?.message ?? `HTTP ${response.status} da API Groq`;
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
          `Timeout após ${timeoutMs / 1000}s ao chamar ${modelName} (Groq)`,
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

    const jsonMode = input.responseFormat === 'json_object' && !input.imagem;

    for (const modelName of candidates) {
      try {
        return await this.callModel(modelName, messages, timeoutMs, jsonMode);
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
            'Limite da API Groq atingido. Tente novamente em alguns minutos.',
          );
        }

        throw new ServiceUnavailableException(
          `Falha ao consultar o tutor IA (Groq): ${message}`,
        );
      }
    }

    throw new ServiceUnavailableException(
      `Não foi possível conectar à API Groq: ${
        lastError?.message ??
        'Verifique GROQ_API_KEY e modelos em apps/api/.env'
      }`,
    );
  }

  async enviarMensagemStream(
    input: EnviarMensagemIaInput,
    onDelta: IaStreamDeltaHandler,
  ): Promise<string> {
    const messages = buildOpenAiChatMessages(input);
    const candidates = this.getModelCandidates(input);
    const timeoutMs = input.imagem ? VISION_TIMEOUT_MS : TEXT_TIMEOUT_MS;
    let lastError: Error | null = null;

    const jsonMode = input.responseFormat === 'json_object' && !input.imagem;

    for (const modelName of candidates) {
      try {
        return await this.callModelStream(
          modelName,
          messages,
          timeoutMs,
          jsonMode,
          onDelta,
        );
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
            'Limite da API Groq atingido. Tente novamente em alguns minutos.',
          );
        }

        throw new ServiceUnavailableException(
          `Falha ao consultar o tutor IA (Groq): ${message}`,
        );
      }
    }

    throw new ServiceUnavailableException(
      `Não foi possível conectar à API Groq: ${
        lastError?.message ??
        'Verifique GROQ_API_KEY e modelos em apps/api/.env'
      }`,
    );
  }
}
