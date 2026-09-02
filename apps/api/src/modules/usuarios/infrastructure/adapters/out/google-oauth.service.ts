import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type { OAuthServicePort } from '../../../core/application/ports/oauth.service.port';

type GoogleProfile = {
  email: string;
  nome: string;
  fotoUrl: string | null;
  googleSub: string;
};

@Injectable()
export class GoogleOAuthService implements OAuthServicePort {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.clientId = config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async getUserInfo(token: string) {
    if (token.split('.').length === 3) {
      return this.fromIdToken(token);
    }

    return this.fromAccessToken(token);
  }

  private async fromIdToken(idToken: string): Promise<GoogleProfile> {
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

  private async fromAccessToken(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Token Google inválido ou expirado');
    }

    const payload = (await response.json()) as {
      email?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };

    if (!payload.email || !payload.sub) {
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
