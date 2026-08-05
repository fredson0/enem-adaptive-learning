import { Inject, Injectable } from '@nestjs/common';
import { AUTH_TOKEN_SERVICE } from '../ports/auth-token.service.port';
import type { AuthTokenServicePort } from '../ports/auth-token.service.port';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: AuthTokenServicePort,
  ) {}

  async execute(rawRefreshToken?: string, userId?: string) {
    if (rawRefreshToken) {
      await this.authTokenService.revogarRefreshToken(rawRefreshToken);
    }
    if (userId) {
      await this.authTokenService.revogarTodosDoUsuario(userId);
    }
  }
}
