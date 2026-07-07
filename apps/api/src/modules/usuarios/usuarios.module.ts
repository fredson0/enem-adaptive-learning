import { Module } from '@nestjs/common';
import { USUARIOS_REPOSITORY } from './core/application/ports/usuarios.repository.port';
import { LoginGoogleUseCase } from './core/application/use-cases/login-google.use-case';
import { PrismaUsuariosRepository } from './infrastructure/adapters/out/persistence/prisma-usuarios.repository';

@Module({
  providers: [
    LoginGoogleUseCase,
    {
      provide: USUARIOS_REPOSITORY,
      useClass: PrismaUsuariosRepository,
    },
  ],
  exports: [LoginGoogleUseCase],
})
export class UsuariosModule {}
