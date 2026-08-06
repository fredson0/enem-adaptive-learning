import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { AtualizarPerfilUseCase } from '../../../../core/application/use-cases/atualizar-perfil.use-case';
import { LoginGoogleUseCase } from '../../../../core/application/use-cases/login-google.use-case';
import { LogoutUseCase } from '../../../../core/application/use-cases/logout.use-case';
import { ObterPerfilUseCase } from '../../../../core/application/use-cases/obter-perfil.use-case';
import { RefreshSessionUseCase } from '../../../../core/application/use-cases/refresh-session.use-case';
import {
  AtualizarPerfilDto,
  LoginGoogleDto,
  LogoutDto,
  RefreshTokenDto,
} from './dto/login-google.dto';

/**
 * Segurança deste controller:
 * - Plano/role NUNCA aceitos no body (whitelist DTO + forbidNonWhitelisted).
 * - Upgrade de plano só via webhook Mercado Pago (futuro) — nunca pelo cliente.
 * - Login/refresh com rate limit agressivo.
 * - Tokens retornados no body para o BFF (Next) setar cookies HttpOnly.
 */
@Controller('usuarios')
export class UsuariosController {
  constructor(
    @Inject(LoginGoogleUseCase)
    private readonly loginGoogleUseCase: LoginGoogleUseCase,
    @Inject(RefreshSessionUseCase)
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    @Inject(LogoutUseCase)
    private readonly logoutUseCase: LogoutUseCase,
    @Inject(ObterPerfilUseCase)
    private readonly obterPerfilUseCase: ObterPerfilUseCase,
    @Inject(AtualizarPerfilUseCase)
    private readonly atualizarPerfilUseCase: AtualizarPerfilUseCase,
  ) {}

  @Post('login-google')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async loginGoogle(@Body() dto: LoginGoogleDto) {
    const { accessToken, refreshToken, userId } =
      await this.loginGoogleUseCase.execute(dto.idToken);
    const user = await this.obterPerfilUseCase.execute(userId);

    return { accessToken, refreshToken, user };
  }

  @Post('auth/refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.refreshSessionUseCase.execute(dto.refreshToken);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post('auth/logout')
  @HttpCode(204)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async logout(@Body() dto: LogoutDto) {
    await this.logoutUseCase.execute(dto.refreshToken);
  }

  @Post('auth/logout-all')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async logoutAll(@CurrentUser() user: JwtPayload) {
    await this.logoutUseCase.execute(undefined, user.sub);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  obterPerfil(@CurrentUser() user: JwtPayload) {
    return this.obterPerfilUseCase.execute(user.sub);
  }

  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  async atualizarPerfil(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AtualizarPerfilDto,
  ) {
    const result = await this.atualizarPerfilUseCase.execute(user.sub, dto);

    return {
      id: result.usuario.id,
      nome: result.usuario.nome,
      email: result.usuario.email,
      fotoUrl: result.usuario.fotoUrl,
      role: result.usuario.role,
      perfil: result.perfil,
    };
  }
}
