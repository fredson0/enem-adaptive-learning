import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
} from '../../../core/application/ports/ia-engine.port';
import {
  enriquecerInputModelTier,
  resolverModelTier,
} from '../../../core/application/helpers/ia-model-tier.helper';
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
    @Inject(NvidiaIaAdapter) private readonly nvidia: NvidiaIaAdapter,
    @Inject(GroqIaAdapter) private readonly groq: GroqIaAdapter,
  ) {}

  private hasGroqExatas(): boolean {
    return Boolean(
      this.config.get<string>('GROQ_API_KEY') &&
        (this.config.get<string>('GROQ_MODEL_EXATAS') ||
          this.config.get<string>('GROQ_MODEL')),
    );
  }

  private getVisionChain(): IaEnginePort[] {
    const chain: IaEnginePort[] = [this.nvidia];

    if (this.config.get<string>('GROQ_API_KEY')) {
      chain.push(this.groq);
    }

    return chain;
  }

  /** Texto em Matemática/Natureza: prioriza Groq 70B quando configurado. */
  private getTextChain(input: EnviarMensagemIaInput): IaEnginePort[] {
    const exatas = resolverModelTier(input) === 'exatas';

    if (exatas && this.hasGroqExatas()) {
      return [this.groq, this.nvidia];
    }

    return [this.nvidia];
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
    const enriched = enriquecerInputModelTier(input);

    if (enriched.imagem) {
      return this.runWithFallback(this.getVisionChain(), enriched);
    }

    const chain = this.getTextChain(enriched);
    if (chain.length === 1) {
      return chain[0]!.enviarMensagem(enriched);
    }

    return this.runWithFallback(chain, enriched);
  }
}
