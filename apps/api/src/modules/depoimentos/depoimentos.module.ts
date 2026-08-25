import { Module } from '@nestjs/common';
import { DEPOIMENTOS_REPOSITORY } from './core/application/ports/depoimentos.repository.port';
import { CriarDepoimentoUseCase } from './core/application/use-cases/criar-depoimento.use-case';
import { ListarDepoimentosPublicosUseCase } from './core/application/use-cases/listar-depoimentos-publicos.use-case';
import { ObterMeuDepoimentoUseCase } from './core/application/use-cases/obter-meu-depoimento.use-case';
import { DepoimentosController } from './infrastructure/adapters/in/http/depoimentos.controller';
import { PrismaDepoimentosRepository } from './infrastructure/adapters/out/persistence/prisma-depoimentos.repository';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule],
  controllers: [DepoimentosController],
  providers: [
    ListarDepoimentosPublicosUseCase,
    CriarDepoimentoUseCase,
    ObterMeuDepoimentoUseCase,
    {
      provide: DEPOIMENTOS_REPOSITORY,
      useClass: PrismaDepoimentosRepository,
    },
  ],
})
export class DepoimentosModule {}
