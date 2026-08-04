import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { AtualizarPerfilUseCase } from '../../../../core/application/use-cases/atualizar-perfil.use-case';
import { LoginGoogleUseCase } from '../../../../core/application/use-cases/login-google.use-case';
import { ObterPerfilUseCase } from '../../../../core/application/use-cases/obter-perfil.use-case';
import {
  AtualizarPerfilDto,
  LoginGoogleDto,
} from './dto/login-google.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    @Inject(LoginGoogleUseCase)
    private readonly loginGoogleUseCase: LoginGoogleUseCase,
    @Inject(ObterPerfilUseCase)
    private readonly obterPerfilUseCase: ObterPerfilUseCase,
    @Inject(AtualizarPerfilUseCase)
    private readonly atualizarPerfilUseCase: AtualizarPerfilUseCase,
  ) {}

  @Post('login-google')
  async loginGoogle(@Body() dto: LoginGoogleDto) {
    const { accessToken, userId } = await this.loginGoogleUseCase.execute(
      dto.idToken,
    );
    const user = await this.obterPerfilUseCase.execute(userId);

    return { accessToken, user };
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
