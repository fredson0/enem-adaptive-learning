import { Module } from '@nestjs/common';
import { METRICAS_REPOSITORY } from './core/application/ports/metricas.repository.port';
import { CalcularProficienciaUseCase } from './core/application/use-cases/calcular-proficiencia.use-case';
import {
  ObterContextoTutorUseCase,
  ObterEvolucaoUseCase,
  ObterLacunasUseCase,
  ObterProficienciaUseCase,
} from './core/application/use-cases/obter-metricas.use-case';
import { MetricasController } from './infrastructure/adapters/in/http/metricas.controller';
import { PrismaMetricasRepository } from './infrastructure/adapters/out/persistence/prisma-metricas.repository';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule],
  controllers: [MetricasController],
  providers: [
    CalcularProficienciaUseCase,
    ObterProficienciaUseCase,
    ObterEvolucaoUseCase,
    ObterLacunasUseCase,
    ObterContextoTutorUseCase,
    {
      provide: METRICAS_REPOSITORY,
      useClass: PrismaMetricasRepository,
    },
  ],
  exports: [
    CalcularProficienciaUseCase,
    ObterContextoTutorUseCase,
    ObterLacunasUseCase,
  ],
})
export class MetricasModule {}
