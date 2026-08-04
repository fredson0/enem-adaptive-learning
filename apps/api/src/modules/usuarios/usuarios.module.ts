import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_TOKEN_SERVICE } from './core/application/ports/auth-token.service.port';
import { OAUTH_SERVICE } from './core/application/ports/oauth.service.port';
import { USUARIOS_REPOSITORY } from './core/application/ports/usuarios.repository.port';
import { AtualizarPerfilUseCase } from './core/application/use-cases/atualizar-perfil.use-case';
import { LoginGoogleUseCase } from './core/application/use-cases/login-google.use-case';
import { ObterPerfilUseCase } from './core/application/use-cases/obter-perfil.use-case';
import { UsuariosController } from './infrastructure/adapters/in/http/usuarios.controller';
import { GoogleOAuthService } from './infrastructure/adapters/out/google-oauth.service';
import { JwtAuthTokenService } from './infrastructure/adapters/out/jwt-auth-token.service';
import { PrismaUsuariosRepository } from './infrastructure/adapters/out/persistence/prisma-usuarios.repository';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UsuariosController],
  providers: [
    LoginGoogleUseCase,
    ObterPerfilUseCase,
    AtualizarPerfilUseCase,
    JwtAuthGuard,
    {
      provide: USUARIOS_REPOSITORY,
      useClass: PrismaUsuariosRepository,
    },
    {
      provide: OAUTH_SERVICE,
      useClass: GoogleOAuthService,
    },
    {
      provide: AUTH_TOKEN_SERVICE,
      useClass: JwtAuthTokenService,
    },
  ],
  exports: [LoginGoogleUseCase, JwtAuthGuard, JwtModule],
})
export class UsuariosModule {}
