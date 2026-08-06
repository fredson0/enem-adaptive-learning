import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
} from '../../../../core/application/ports/ia-engine.port';
import { buildTutorSystemPrompt } from '../../../../core/application/helpers/tutor-prompts';

@Injectable()
export class GeminiIaAdapter implements IaEnginePort {
  private client: GoogleGenerativeAI | null = null;
  private readonly modelName: string;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.modelName = config.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  }

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

  async enviarMensagem(input: EnviarMensagemIaInput): Promise<string> {
    try {
      const model = this.getClient().getGenerativeModel({
        model: this.modelName,
        systemInstruction: buildTutorSystemPrompt(input.nivelAluno),
      });

      const contents = [
        ...(input.historico ?? []).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.texto }],
        })),
        {
          role: 'user' as const,
          parts: [{ text: input.texto }],
        },
      ];

      const result = await model.generateContent({ contents });
      const text = result.response.text()?.trim();

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

      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';

      if (message.includes('429') || message.toLowerCase().includes('quota')) {
        throw new ServiceUnavailableException(
          'Limite da API Gemini atingido. Tente novamente mais tarde.',
        );
      }

      throw new ServiceUnavailableException(
        `Falha ao consultar o tutor IA: ${message}`,
      );
    }
  }
}
