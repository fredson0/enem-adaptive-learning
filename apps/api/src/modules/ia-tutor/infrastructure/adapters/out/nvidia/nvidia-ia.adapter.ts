import {
  Inject,
  Injectable,
  Logger,
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

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

/**
 * Primário: Nemotron 3 Nano Omni 30B — único Nemotron hosted que ainda
 * responde após o EOL de 26/08/2026 (Nano 9B/8B, Llama 3.1/3.3 e Super 49B).
 */
const NVIDIA_TEXT_DEFAULT = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';
const NVIDIA_TEXT_FAST_FALLBACK = 'openai/gpt-oss-20b';
const NVIDIA_TEXT_EXATAS = 'openai/gpt-oss-120b';

/** IDs mortos (410/timeout) → sucessor vivo, para NVIDIA_MODEL antigo no .env. */
const MODELOS_RETIRADOS: Record<string, string> = {
  'nvidia/nemotron-3-nano-30b-a3b': NVIDIA_TEXT_DEFAULT,
  'nvidia/nemotron-3.5-lightning-30b-a3b': NVIDIA_TEXT_DEFAULT,
  'nvidia/nvidia-nemotron-nano-9b-v2': NVIDIA_TEXT_DEFAULT,
  'nvidia/llama-3.1-nemotron-nano-8b-v1': NVIDIA_TEXT_DEFAULT,
  'nvidia/nemotron-mini-4b-instruct': NVIDIA_TEXT_DEFAULT,
  'meta/llama-3.1-8b-instruct': NVIDIA_TEXT_FAST_FALLBACK,
  'meta/llama-3.3-70b-instruct': NVIDIA_TEXT_EXATAS,
  'nvidia/llama-3.3-nemotron-super-49b-v1': NVIDIA_TEXT_EXATAS,
  'nvidia/llama-3.3-nemotron-super-49b-v1.5': NVIDIA_TEXT_EXATAS,
};

const TEXT_MODEL_FALLBACKS = [
  NVIDIA_TEXT_DEFAULT,
  NVIDIA_TEXT_FAST_FALLBACK,
  NVIDIA_TEXT_EXATAS,
] as const;

const TEXT_MODEL_EXATAS_FALLBACKS = [
  NVIDIA_TEXT_EXATAS,
  NVIDIA_TEXT_DEFAULT,
  NVIDIA_TEXT_FAST_FALLBACK,
] as const;

const VISION_MODEL_FALLBACKS = [
  'meta/llama-3.2-11b-vision-instruct',
  'meta/llama-3.2-90b-vision-instruct',
] as const;

const TEXT_TIMEOUT_MS = 30_000;
const VISION_TIMEOUT_MS = 90_000;

function extrairTextoNvidia(data: {
  choices?: {
    message?: { content?: string; reasoning_content?: string };
  }[];
}): string {
  const message = data.choices?.[0]?.message;
  const bruto =
    message?.content?.trim() ||
    message?.reasoning_content?.trim() ||
    '';

  if (!bruto) return '';
  if (!bruto.includes('</think>')) return bruto;
  return bruto.split('</think>').pop()?.trim() ?? bruto;
}

@Injectable()
export class NvidiaIaAdapter implements IaEnginePort {
  private readonly logger = new Logger(NvidiaIaAdapter.name);

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
    let raw: string[];

    if (input.imagem) {
      const configured = this.config.get<string>('NVIDIA_VISION_MODEL');
      raw = configured
        ? [
            configured,
            ...VISION_MODEL_FALLBACKS.filter((model) => model !== configured),
          ]
        : [...VISION_MODEL_FALLBACKS];
    } else {
      const tier = resolverModelTier(input);
      raw = montarCandidatosModelo({
        tier,
        configuredDefault: this.config.get<string>('NVIDIA_MODEL'),
        configuredExatas: this.config.get<string>('NVIDIA_MODEL_EXATAS'),
        fallbacks:
          tier === 'exatas' ? TEXT_MODEL_EXATAS_FALLBACKS : TEXT_MODEL_FALLBACKS,
      });
    }

    return [...new Set(raw.map((model) => MODELOS_RETIRADOS[model] ?? model))];
  }

  private isRetryableError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('404') ||
      lower.includes('410') ||
      lower.includes('gone') ||
      lower.includes('end of life') ||
      lower.includes('not found') ||
      lower.includes('vazia') ||
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
      url: NVIDIA_BASE_URL,
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
      const response = await fetch(NVIDIA_BASE_URL, {
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
        choices?: {
          message?: { content?: string; reasoning_content?: string };
        }[];
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

      const text = extrairTextoNvidia(data ?? {});
      if (!text) {
        throw new Error(`Resposta vazia de ${modelName}`);
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

    const jsonMode = input.responseFormat === 'json_object' && !input.imagem;

    for (const modelName of candidates) {
      try {
        return await this.callModel(
          modelName,
          messages,
          timeoutMs,
          jsonMode,
        );
      } catch (error) {
        if (error instanceof ServiceUnavailableException) {
          throw error;
        }

        const message =
          error instanceof Error ? error.message : 'Erro desconhecido';

        this.logger.warn(`NVIDIA ${modelName} falhou: ${message}`);

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

        this.logger.warn(`NVIDIA stream ${modelName} falhou: ${message}`);

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
