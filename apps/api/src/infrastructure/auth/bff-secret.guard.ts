import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * Rotas que emitem tokens só podem ser chamadas pelo BFF (Next.js server).
 * O browser nunca deve receber access/refresh no JSON — apenas cookies HttpOnly.
 */
@Injectable()
export class BffSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('BFF_INTERNAL_SECRET');
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    if (!secret) {
      if (isProd) {
        throw new ForbiddenException(
          'BFF_INTERNAL_SECRET não configurado no servidor',
        );
      }
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers['x-bff-secret'];

    if (typeof header !== 'string' || header !== secret) {
      throw new ForbiddenException(
        'Emissão de tokens permitida apenas via BFF autenticado',
      );
    }

    return true;
  }
}
