import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import type {
  AuthTokenServicePort,
  RefreshResult,
  TokenPair,
} from '../../../core/application/ports/auth-token.service.port';
import { Usuario } from '../../../core/domain/entities/usuario.entity';

@Injectable()
export class JwtAuthTokenService implements AuthTokenServicePort {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async gerarAccessToken(usuario: Usuario): Promise<string> {
    const expiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';

    return this.jwtService.signAsync(
      {
        sub: usuario.id,
        email: usuario.email,
        role: usuario.role,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );
  }

  /** Compat: gera só access (não use em login — prefira emitirParTokens). */
  async gerarToken(usuario: Usuario): Promise<string> {
    return this.gerarAccessToken(usuario);
  }

  async emitirParTokens(usuario: Usuario): Promise<TokenPair> {
    const accessToken = await this.gerarAccessToken(usuario);
    const refreshToken = await this.criarRefreshToken(usuario.id);
    return { accessToken, refreshToken };
  }

  async rotacionarRefreshToken(rawRefreshToken: string): Promise<RefreshResult> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      if (stored && !stored.revokedAt) {
        // Possível reuse de token já rotacionado → revoga todos (segurança)
        await this.revogarTodosDoUsuario(stored.userId);
      }
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const usuarioRow = await this.prisma.usuario.findUnique({
      where: { id: stored.userId },
    });

    if (!usuarioRow) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const usuario = Usuario.criar({
      id: usuarioRow.id,
      nome: usuarioRow.nome,
      email: usuarioRow.email,
      fotoUrl: usuarioRow.fotoUrl,
      role: usuarioRow.role as 'ALUNO' | 'PROFESSOR' | 'ADMIN',
    });

    const accessToken = await this.gerarAccessToken(usuario);
    const refreshToken = await this.criarRefreshToken(stored.userId);

    return { accessToken, refreshToken, userId: stored.userId };
  }

  async revogarRefreshToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revogarTodosDoUsuario(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async criarRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(raw);
    const days = Number(
      this.config.get<string>('JWT_REFRESH_EXPIRES_DAYS') ?? '7',
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return raw;
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
