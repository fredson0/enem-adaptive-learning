import { Module } from '@nestjs/common';
import { QUESTOES_REPOSITORY } from './core/application/ports/questoes.repository.port';
import { BuscarQuestoesFiltroUseCase } from './core/application/use-cases/buscar-questoes-filtro.use-case';
import { QuestoesController } from './infrastructure/adapters/in/http/questoes.controller';
import { PrismaQuestoesRepository } from './infrastructure/adapters/out/persistence/prisma-questoes.repository';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule],
  controllers: [QuestoesController],
  providers: [
    BuscarQuestoesFiltroUseCase,
    {
      provide: QUESTOES_REPOSITORY,
      useClass: PrismaQuestoesRepository,
    },
  ],
  exports: [QUESTOES_REPOSITORY, BuscarQuestoesFiltroUseCase],
})
export class QuestoesModule {}
