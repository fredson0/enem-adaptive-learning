import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
  IaStreamDeltaHandler,
} from '../../../../core/application/ports/ia-engine.port';
import { buildTutorSystemPrompt } from '../../../../core/application/helpers/tutor-prompts';
import {
  montarCandidatosModelo,
  resolverModelTier,
} from '../../../../core/application/helpers/ia-model-tier.helper';

/** Modelos estáveis no Google AI Studio (ver docs/ESCOLHA-MODELO-IA.md). */
const MODEL_FALLBACKS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
] as const;

const REQUEST_TIMEOUT_MS = 45_000;

@Injectable()
export class GeminiIaAdapter implements IaEnginePort {
  private readonly logger = new Logger(GeminiIaAdapter.name);
  private client: GoogleGenerativeAI | null = null;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private getClient(): GoogleGenerativeAI {
    if (this.client) {
      return this.client;
    }

    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY não configurada em apps/api/.env',
      );
    }

    this.client = new GoogleGenerativeAI(apiKey);
    return this.client;
  }

  private getModelCandidates(input: EnviarMensagemIaInput): string[] {
    const tier = resolverModelTier(input);

    return montarCandidatosModelo({
      tier,
      configuredDefault: this.config.get<string>('GEMINI_MODEL'),
      configuredExatas: this.config.get<string>('GEMINI_MODEL_EXATAS'),
      fallbacks: MODEL_FALLBACKS,
    });
  }

  private isRetryableError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('404') ||
      lower.includes('not found') ||
      lower.includes('no longer available') ||
      lower.includes('fetch failed') ||
      lower.includes('econnreset') ||
      lower.includes('etimedout') ||
      lower.includes('socket hang up') ||
      lower.includes('network') ||
      lower.includes('503') ||
      lower.includes('502') ||
      lower.includes('500')
    );
  }

  private async withTimeout<T>(promise: Promise<T>, modelName: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Timeout após ${REQUEST_TIMEOUT_MS / 1000}s ao chamar ${modelName}`,
          ),
        );
      }, REQUEST_TIMEOUT_MS);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private async generateWithModel(
    modelName: string,
    input: EnviarMensagemIaInput,
  ): Promise<string> {
    const jsonMode = input.responseFormat === 'json_object' && !input.imagem;

    const model = this.getClient().getGenerativeModel({
      model: modelName,
      systemInstruction:
        input.systemPromptOverride ??
        buildTutorSystemPrompt(
          input.nivelAluno,
          input.contextoMetricas,
          input.contextoTrilha,
        ),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: jsonMode ? 0.2 : undefined,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    });

    const contents = [
      ...(input.historico ?? []).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.texto }],
      })),
      {
        role: 'user' as const,
        parts: input.imagem
          ? [
              { text: input.texto },
              {
                inlineData: {
                  mimeType: input.imagem.mimeType,
                  data: input.imagem.base64,
                },
              },
            ]
          : [{ text: input.texto }],
      },
    ];

    const result = await this.withTimeout(
      model.generateContent({ contents }),
      modelName,
    );
    const text = result.response.text()?.trim();

    if (!text) {
      throw new ServiceUnavailableException(
        'O tutor não retornou uma resposta. Tente novamente.',
      );
    }

    return text;
  }

  async enviarMensagem(input: EnviarMensagemIaInput): Promise<string> {
    const candidates = this.getModelCandidates(input);
    let lastError: Error | null = null;

    for (const modelName of candidates) {
      try {
        return await this.generateWithModel(modelName, input);
      } catch (error) {
    if (error instanceof ServiceUnavailableException) {
          lastError = error;
          continue;
        }

        const message =
          error instanceof Error ? error.message : 'Erro desconhecido';

        this.logger.warn(`Gemini ${modelName} falhou: ${message}`);

        if (this.isRetryableError(message)) {
          lastError = error instanceof Error ? error : new Error(message);
          continue;
        }

        if (message.includes('429') || message.toLowerCase().includes('quota')) {
          throw new ServiceUnavailableException(
            'Limite da API Gemini atingido. Tente novamente mais tarde.',
          );
        }

        lastError = error instanceof Error ? error : new Error(message);
        continue;
      }
    }

    throw new ServiceUnavailableException(
      'Não foi possível conectar ao tutor IA. Verifique GEMINI_API_KEY e GEMINI_MODEL em apps/api/.env (use gemini-2.5-flash) e tente novamente.',
    );
  }

  async enviarMensagemStream(
    input: EnviarMensagemIaInput,
    onDelta: IaStreamDeltaHandler,
  ): Promise<string> {
    const text = await this.enviarMensagem(input);
    await onDelta(text);
    return text;
  }
}
