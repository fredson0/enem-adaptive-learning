import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
} from '../../../core/application/ports/ia-engine.port';
import { GeminiIaAdapter } from './gemini/gemini-ia.adapter';
import { NvidiaIaAdapter } from './nvidia/nvidia-ia.adapter';

function isFallbackWorthy(error: unknown): boolean {
  if (!(error instanceof ServiceUnavailableException)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('limite') ||
    message.includes('quota') ||
    message.includes('429') ||
    message.includes('não foi possível conectar') ||
    message.includes('fetch failed') ||
    message.includes('timeout') ||
    message.includes('nvidia')
  );
}

@Injectable()
export class IaEngineRouter implements IaEnginePort {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(GeminiIaAdapter) private readonly gemini: GeminiIaAdapter,
    @Inject(NvidiaIaAdapter) private readonly nvidia: NvidiaIaAdapter,
  ) {}

  async enviarMensagem(input: EnviarMensagemIaInput): Promise<string> {
    if (input.imagem) {
      return this.gemini.enviarMensagem(input);
    }

    const provider = (this.config.get<string>('IA_PROVIDER') ?? 'gemini').toLowerCase();
    const primary = provider === 'nvidia' ? this.nvidia : this.gemini;
    const fallback = provider === 'nvidia' ? this.gemini : this.nvidia;

    try {
      return await primary.enviarMensagem(input);
    } catch (error) {
      if (!isFallbackWorthy(error)) {
        throw error;
      }

      try {
        return await fallback.enviarMensagem(input);
      } catch {
        throw error;
      }
    }
  }
}
