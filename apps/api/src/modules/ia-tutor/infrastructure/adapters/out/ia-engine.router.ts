import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EnviarMensagemIaInput,
  IaEnginePort,
  IaStreamDeltaHandler,
} from '../../../core/application/ports/ia-engine.port';
import {
  enriquecerInputModelTier,
  resolverModelTier,
} from '../../../core/application/helpers/ia-model-tier.helper';
import { GroqIaAdapter } from './groq/groq-ia.adapter';
import { NvidiaIaAdapter } from './nvidia/nvidia-ia.adapter';

function chaveUtilizavel(value?: string): boolean {
  const key = value?.trim() ?? '';
  if (key.length < 16) return false;
  return !/sua_chave|cole_sua|changeme|placeholder/i.test(key);
}

function isFallbackWorthy(error: unknown): boolean {
  if (!(error instanceof ServiceUnavailableException)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('limite') ||
    message.includes('quota') ||
    message.includes('429') ||
    message.includes('resourceexhausted') ||
    message.includes('request limit') ||
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
  private readonly logger = new Logger(IaEngineRouter.name);

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(NvidiaIaAdapter) private readonly nvidia: NvidiaIaAdapter,
    @Inject(GroqIaAdapter) private readonly groq: GroqIaAdapter,
  ) {}

  private hasGroq(): boolean {
    return chaveUtilizavel(this.config.get<string>('GROQ_API_KEY'));
  }

  private hasGroqExatas(): boolean {
    return Boolean(
      this.hasGroq() &&
        (this.config.get<string>('GROQ_MODEL_EXATAS') ||
          this.config.get<string>('GROQ_MODEL')),
    );
  }

  private getVisionChain(): IaEnginePort[] {
    const chain: IaEnginePort[] = [this.nvidia];

    if (this.hasGroq()) {
      chain.push(this.groq);
    }

    return chain;
  }

  /**
   * Texto: NVIDIA (e Groq em exatas, se configurado). Sem Gemini.
   */
  private getTextChain(input: EnviarMensagemIaInput): IaEnginePort[] {
    const exatas = resolverModelTier(input) === 'exatas';
    const chain: IaEnginePort[] =
      exatas && this.hasGroqExatas()
        ? [this.groq, this.nvidia]
        : this.hasGroq()
          ? [this.nvidia, this.groq]
          : [this.nvidia];

    return chain;
  }

  private async runWithFallback(
    providers: IaEnginePort[],
    input: EnviarMensagemIaInput,
  ): Promise<string> {
    let firstError: unknown = null;

    for (const provider of providers) {
      try {
        return await provider.enviarMensagem(input);
      } catch (error) {
        this.logger.warn(
          `${provider.constructor.name} falhou: ${
            error instanceof Error ? error.message : 'erro desconhecido'
          }`,
        );
        if (!firstError) firstError = error;
        if (!isFallbackWorthy(error)) {
          throw error;
        }
      }
    }

    if (firstError instanceof ServiceUnavailableException) {
      throw firstError;
    }

    throw new ServiceUnavailableException(
      'Não foi possível processar a mensagem com os provedores de IA disponíveis.',
    );
  }

  private async runStreamWithFallback(
    providers: IaEnginePort[],
    input: EnviarMensagemIaInput,
    onDelta: IaStreamDeltaHandler,
  ): Promise<string> {
    let firstError: unknown = null;

    for (const provider of providers) {
      let sentAny = false;
      try {
        return await provider.enviarMensagemStream(input, async (delta) => {
          sentAny = true;
          await onDelta(delta);
        });
      } catch (error) {
        this.logger.warn(
          `${provider.constructor.name} stream falhou: ${
            error instanceof Error ? error.message : 'erro desconhecido'
          }`,
        );
        if (!firstError) firstError = error;
        if (!isFallbackWorthy(error) || sentAny) {
          throw error;
        }
      }
    }

    if (firstError instanceof ServiceUnavailableException) {
      throw firstError;
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
    return this.runWithFallback(chain, enriched);
  }

  async enviarMensagemStream(
    input: EnviarMensagemIaInput,
    onDelta: IaStreamDeltaHandler,
  ): Promise<string> {
    const enriched = enriquecerInputModelTier(input);

    if (enriched.imagem) {
      return this.runStreamWithFallback(this.getVisionChain(), enriched, onDelta);
    }

    const chain = this.getTextChain(enriched);
    return this.runStreamWithFallback(chain, enriched, onDelta);
  }
}
