import { Module, forwardRef } from '@nestjs/common';
import { SIMULADOS_REPOSITORY } from './core/application/ports/simulados.repository.port';
import {
  EnviarRespostaUseCase,
  FinalizarSimuladoUseCase,
} from './core/application/use-cases/enviar-resposta.use-case';
import { GerarSimuladoUseCase } from './core/application/use-cases/gerar-simulado.use-case';
import { GerarSimuladoComIaUseCase } from './core/application/use-cases/gerar-simulado-com-ia.use-case';
import { ListarSimuladosUseCase } from './core/application/use-cases/listar-simulados.use-case';
import {
  ObterSimuladoUseCase,
} from './core/application/use-cases/obter-simulado.use-case';
import { SimuladosController } from './infrastructure/adapters/in/http/simulados.controller';
import { PrismaSimuladosRepository } from './infrastructure/adapters/out/persistence/prisma-simulados.repository';
import { IaTutorModule } from '../ia-tutor/ia-tutor.module';
import { QuestoesModule } from '../questoes/questoes.module';
import { MetricasModule } from '../metricas/metricas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule, QuestoesModule, MetricasModule, forwardRef(() => IaTutorModule)],
  controllers: [SimuladosController],
  providers: [
    GerarSimuladoUseCase,
    GerarSimuladoComIaUseCase,
    ListarSimuladosUseCase,
    ObterSimuladoUseCase,
    EnviarRespostaUseCase,
    FinalizarSimuladoUseCase,
    {
      provide: SIMULADOS_REPOSITORY,
      useClass: PrismaSimuladosRepository,
    },
  ],
  exports: [GerarSimuladoComIaUseCase],
})
export class SimuladosModule {}
