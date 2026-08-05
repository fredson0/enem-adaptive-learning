import { Module } from '@nestjs/common';
import { SIMULADOS_REPOSITORY } from './core/application/ports/simulados.repository.port';
import {
  EnviarRespostaUseCase,
  FinalizarSimuladoUseCase,
} from './core/application/use-cases/enviar-resposta.use-case';
import { GerarSimuladoUseCase } from './core/application/use-cases/gerar-simulado.use-case';
import {
  ListarSimuladosUseCase,
  ObterSimuladoUseCase,
} from './core/application/use-cases/obter-simulado.use-case';
import { SimuladosController } from './infrastructure/adapters/in/http/simulados.controller';
import { PrismaSimuladosRepository } from './infrastructure/adapters/out/persistence/prisma-simulados.repository';
import { QuestoesModule } from '../questoes/questoes.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule, QuestoesModule],
  controllers: [SimuladosController],
  providers: [
    GerarSimuladoUseCase,
    ListarSimuladosUseCase,
    ObterSimuladoUseCase,
    EnviarRespostaUseCase,
    FinalizarSimuladoUseCase,
    {
      provide: SIMULADOS_REPOSITORY,
      useClass: PrismaSimuladosRepository,
    },
  ],
})
export class SimuladosModule {}
