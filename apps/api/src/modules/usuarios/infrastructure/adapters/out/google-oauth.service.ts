import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type { OAuthServicePort } from '../../../core/application/ports/oauth.service.port';

@Injectable()
export class GoogleOAuthService implements OAuthServicePort {
  private readonly client: OAuth2Client;

  constructor(private readonly config: ConfigService) {
    this.client = new OAuth2Client(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async getUserInfo(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
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
  }
}
