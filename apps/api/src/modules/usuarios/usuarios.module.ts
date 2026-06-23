import { Module } from '@nestjs/common';
import { LoginGoogleUseCase } from './core/application/use-cases/login-google.use-case';

@Module({
  providers: [LoginGoogleUseCase],
  exports: [LoginGoogleUseCase],
})
export class UsuariosModule {}
