import { Module } from '@nestjs/common';
import { IA_ENGINE } from './core/application/ports/ia-engine.port';
import { EnviarMensagemTutorUseCase } from './core/application/use-cases/enviar-mensagem-tutor.use-case';
import { ExplicarErroUseCase } from './core/application/use-cases/explicar-erro.use-case';
import { IaTutorController } from './infrastructure/adapters/in/http/ia-tutor.controller';
import { GeminiIaAdapter } from './infrastructure/adapters/out/gemini/gemini-ia.adapter';
import { UsoTokensIaService } from './infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { QuestoesModule } from '../questoes/questoes.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule, QuestoesModule],
  controllers: [IaTutorController],
  providers: [
    EnviarMensagemTutorUseCase,
    ExplicarErroUseCase,
    UsoTokensIaService,
    {
      provide: IA_ENGINE,
      useClass: GeminiIaAdapter,
    },
  ],
  exports: [IA_ENGINE],
})
export class IaTutorModule {}
