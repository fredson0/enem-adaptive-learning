import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { AUTH_TOKEN_SERVICE } from './core/application/ports/auth-token.service.port';
import { OAUTH_SERVICE } from './core/application/ports/oauth.service.port';
import { USUARIOS_REPOSITORY } from './core/application/ports/usuarios.repository.port';
import { AtualizarPerfilUseCase } from './core/application/use-cases/atualizar-perfil.use-case';
import { LoginGoogleUseCase } from './core/application/use-cases/login-google.use-case';
import { LogoutUseCase } from './core/application/use-cases/logout.use-case';
import { ObterPerfilUseCase } from './core/application/use-cases/obter-perfil.use-case';
import { RefreshSessionUseCase } from './core/application/use-cases/refresh-session.use-case';
import { UsuariosController } from './infrastructure/adapters/in/http/usuarios.controller';
import { GoogleOAuthService } from './infrastructure/adapters/out/google-oauth.service';
import { JwtAuthTokenService } from './infrastructure/adapters/out/jwt-auth-token.service';
import { PrismaUsuariosRepository } from './infrastructure/adapters/out/persistence/prisma-usuarios.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [UsuariosController],
  providers: [
    LoginGoogleUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
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
  exports: [
    LoginGoogleUseCase,
    JwtAuthGuard,
    JwtModule,
    AUTH_TOKEN_SERVICE,
    USUARIOS_REPOSITORY,
  ],
})
export class UsuariosModule {}
