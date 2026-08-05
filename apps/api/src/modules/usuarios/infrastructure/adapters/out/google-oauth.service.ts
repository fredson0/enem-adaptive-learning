import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type { OAuthServicePort } from '../../../core/application/ports/oauth.service.port';

@Injectable()
export class GoogleOAuthService implements OAuthServicePort {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.clientId = config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async getUserInfo(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload?.email || !payload.sub) {
        throw new UnauthorizedException('Token Google inválido');
      }

      return {
        email: payload.email,
        nome: payload.name ?? payload.email.split('@')[0],
        fotoUrl: payload.picture ?? null,
        googleSub: payload.sub,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token Google inválido ou expirado');
    }
  }
}
