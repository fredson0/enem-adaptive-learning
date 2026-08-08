import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
} from '../../../core/application/ports/ia-engine.port';
import { GeminiIaAdapter } from './gemini/gemini-ia.adapter';
import { GroqIaAdapter } from './groq/groq-ia.adapter';
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
    message.includes('não configurada') ||
    message.includes('não foi possível conectar') ||
    message.includes('fetch failed') ||
    message.includes('timeout') ||
    message.includes('nvidia') ||
    message.includes('groq') ||
    message.includes('gemini')
  );
}

@Injectable()
export class IaEngineRouter implements IaEnginePort {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(GeminiIaAdapter) private readonly gemini: GeminiIaAdapter,
    @Inject(NvidiaIaAdapter) private readonly nvidia: NvidiaIaAdapter,
    @Inject(GroqIaAdapter) private readonly groq: GroqIaAdapter,
  ) {}

  private getVisionChain(): IaEnginePort[] {
    const chain: IaEnginePort[] = [this.nvidia];

    if (this.config.get<string>('GROQ_API_KEY')) {
      chain.push(this.groq);
    }

    chain.push(this.gemini);
    return chain;
  }

  private async runWithFallback(
    providers: IaEnginePort[],
    input: EnviarMensagemIaInput,
  ): Promise<string> {
    let lastError: unknown = null;

    for (const provider of providers) {
      try {
        return await provider.enviarMensagem(input);
      } catch (error) {
        lastError = error;
        if (!isFallbackWorthy(error)) {
          throw error;
        }
      }
    }

    if (lastError instanceof ServiceUnavailableException) {
      throw lastError;
    }

    throw new ServiceUnavailableException(
      'Não foi possível processar a mensagem com os provedores de IA disponíveis.',
    );
  }

  async enviarMensagem(input: EnviarMensagemIaInput): Promise<string> {
    if (input.imagem) {
      return this.runWithFallback(this.getVisionChain(), input);
    }

    const provider = (this.config.get<string>('IA_PROVIDER') ?? 'gemini').toLowerCase();
    const primary = provider === 'nvidia' ? this.nvidia : this.gemini;
    const fallback = provider === 'nvidia' ? this.gemini : this.nvidia;

    return this.runWithFallback([primary, fallback], input);
  }
}
