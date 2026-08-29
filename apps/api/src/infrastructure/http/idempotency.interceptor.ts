import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash } from 'node:crypto';
import type { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import type { Request, Response } from 'express';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import {
  IDEMPOTENT_KEY,
  type IdempotentOptions,
} from './idempotent.decorator';
import { IdempotencyService } from './idempotency.service';

function hashRequest(body: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(body ?? {}))
    .digest('hex');
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotency: IdempotencyService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const options = this.reflector.getAllAndOverride<IdempotentOptions>(
      IDEMPOTENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: JwtPayload }>();
    const response = http.getResponse<Response>();
    const chave = request.headers['idempotency-key'];

    if (!options && !chave) {
      return next.handle();
    }

    if (options?.required && (!chave || typeof chave !== 'string')) {
      throw new BadRequestException('Header Idempotency-Key é obrigatório');
    }

    if (!chave || typeof chave !== 'string') {
      return next.handle();
    }

    const userId = request.user?.sub;
    if (!userId) {
      throw new BadRequestException(
        'Idempotência exige usuário autenticado',
      );
    }

    const endpoint = `${request.method} ${request.route?.path ?? request.path}`;
    const requestHash = hashRequest(request.body);
    const begin = await this.idempotency.begin({
      chave,
      userId,
      endpoint,
      requestHash,
    });

    if (begin.action === 'replay') {
      response.status(begin.httpStatus);
      return of(begin.response);
    }

    if (begin.action === 'conflict') {
      throw new ConflictException(begin.message);
    }

    return next.handle().pipe(
      tap(async (body) => {
        await this.idempotency.complete(chave, body, response.statusCode || 200);
      }),
      catchError((error) => {
        void this.idempotency.fail(chave);
        return throwError(() => error);
      }),
    );
  }
}
