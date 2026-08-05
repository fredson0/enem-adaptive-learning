import { Inject, Injectable } from '@nestjs/common';
import { AUTH_TOKEN_SERVICE } from '../ports/auth-token.service.port';
import type { AuthTokenServicePort } from '../ports/auth-token.service.port';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: AuthTokenServicePort,
  ) {}

  execute(rawRefreshToken: string) {
    return this.authTokenService.rotacionarRefreshToken(rawRefreshToken);
  }
}
