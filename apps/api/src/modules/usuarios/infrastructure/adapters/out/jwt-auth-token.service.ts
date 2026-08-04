import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokenServicePort } from '../../../core/application/ports/auth-token.service.port';
import { Usuario } from '../../../core/domain/entities/usuario.entity';

@Injectable()
export class JwtAuthTokenService implements AuthTokenServicePort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async gerarToken(usuario: Usuario): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: usuario.id,
        email: usuario.email,
        role: usuario.role,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );
  }
}
