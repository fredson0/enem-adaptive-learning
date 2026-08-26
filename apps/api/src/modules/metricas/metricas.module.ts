import { Module } from '@nestjs/common';
import { METRICAS_REPOSITORY } from './core/application/ports/metricas.repository.port';
import { CalcularProficienciaUseCase } from './core/application/use-cases/calcular-proficiencia.use-case';
import { ObterCoberturaUseCase } from './core/application/use-cases/obter-cobertura.use-case';
import { ObterFrequenciaTemasUseCase } from './core/application/use-cases/obter-frequencia-temas.use-case';
import {
  ObterContextoTutorUseCase,
  ObterEvolucaoUseCase,
  ObterLacunasUseCase,
  ObterProficienciaUseCase,
} from './core/application/use-cases/obter-metricas.use-case';
import {
  ObterTrilhaUseCase,
  MarcarEtapaTrilhaUseCase,
  MarcarChecklistIaUseCase,
  SalvarDiagnosticoTrilhaUseCase,
} from './core/application/use-cases/obter-trilha.use-case';
import { MetricasController } from './infrastructure/adapters/in/http/metricas.controller';
import { PrismaMetricasRepository } from './infrastructure/adapters/out/persistence/prisma-metricas.repository';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { QuestoesModule } from '../questoes/questoes.module';

@Module({
  imports: [UsuariosModule, QuestoesModule],
  controllers: [MetricasController],
  providers: [
    CalcularProficienciaUseCase,
    ObterProficienciaUseCase,
    ObterEvolucaoUseCase,
    ObterLacunasUseCase,
    ObterContextoTutorUseCase,
    ObterTrilhaUseCase,
    SalvarDiagnosticoTrilhaUseCase,
    MarcarEtapaTrilhaUseCase,
    MarcarChecklistIaUseCase,
    ObterCoberturaUseCase,
    ObterFrequenciaTemasUseCase,
    {
      provide: METRICAS_REPOSITORY,
      useClass: PrismaMetricasRepository,
    },
  ],
  exports: [
    CalcularProficienciaUseCase,
    ObterContextoTutorUseCase,
    ObterLacunasUseCase,
    ObterTrilhaUseCase,
    ObterCoberturaUseCase,
    ObterFrequenciaTemasUseCase,
    METRICAS_REPOSITORY,
  ],
})
export class MetricasModule {}
