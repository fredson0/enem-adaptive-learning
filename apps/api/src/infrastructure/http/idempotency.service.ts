import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IdempotencyStatus, Prisma } from '@generated/prisma';
import { PrismaService } from '../database/prisma.service';

const TTL_HOURS = 24;

export type IdempotencyBeginResult =
  | { action: 'process' }
  | { action: 'replay'; response: unknown; httpStatus: number }
  | { action: 'conflict'; message: string };

@Injectable()
export class IdempotencyService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private expiresAt(): Date {
    const date = new Date();
    date.setHours(date.getHours() + TTL_HOURS);
    return date;
  }

  async begin(input: {
    chave: string;
    userId: string;
    endpoint: string;
    requestHash: string;
  }): Promise<IdempotencyBeginResult> {
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { chave: input.chave },
    });

    if (existing) {
      if (existing.userId && existing.userId !== input.userId) {
        throw new ConflictException('Chave de idempotência já utilizada');
      }

      if (existing.requestHash && existing.requestHash !== input.requestHash) {
        throw new ConflictException(
          'Chave de idempotência reutilizada com payload diferente',
        );
      }

      if (
        existing.status === IdempotencyStatus.COMPLETED &&
        existing.response !== null &&
        existing.httpStatus !== null
      ) {
        return {
          action: 'replay',
          response: existing.response,
          httpStatus: existing.httpStatus,
        };
      }

      if (existing.status === IdempotencyStatus.PROCESSING) {
        return {
          action: 'conflict',
          message: 'Requisição idempotente ainda em processamento',
        };
      }
    }

    await this.prisma.idempotencyKey.upsert({
      where: { chave: input.chave },
      create: {
        chave: input.chave,
        userId: input.userId,
        endpoint: input.endpoint,
        requestHash: input.requestHash,
        status: IdempotencyStatus.PROCESSING,
        expiresAt: this.expiresAt(),
      },
      update: {
        userId: input.userId,
        endpoint: input.endpoint,
        requestHash: input.requestHash,
        status: IdempotencyStatus.PROCESSING,
        response: Prisma.JsonNull,
        httpStatus: null,
        expiresAt: this.expiresAt(),
      },
    });

    return { action: 'process' };
  }

  async complete(chave: string, response: unknown, httpStatus: number) {
    await this.prisma.idempotencyKey.update({
      where: { chave },
      data: {
        status: IdempotencyStatus.COMPLETED,
        response: response as object,
        httpStatus,
      },
    });
  }

  async fail(chave: string) {
    await this.prisma.idempotencyKey.update({
      where: { chave },
      data: {
        status: IdempotencyStatus.FAILED,
      },
    });
  }
}
