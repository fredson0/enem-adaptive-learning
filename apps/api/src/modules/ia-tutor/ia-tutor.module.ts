import { Module } from '@nestjs/common';
import { IA_ENGINE } from './core/application/ports/ia-engine.port';
import { EnviarMensagemTutorUseCase } from './core/application/use-cases/enviar-mensagem-tutor.use-case';
import { ExplicarErroUseCase } from './core/application/use-cases/explicar-erro.use-case';
import { PedirDicaQuestaoUseCase } from './core/application/use-cases/pedir-dica-questao.use-case';
import { ObterSaldoTokensUseCase } from './core/application/use-cases/obter-saldo-tokens.use-case';
import { IaTutorController } from './infrastructure/adapters/in/http/ia-tutor.controller';
import { GeminiIaAdapter } from './infrastructure/adapters/out/gemini/gemini-ia.adapter';
import { IaEngineRouter } from './infrastructure/adapters/out/ia-engine.router';
import { NvidiaIaAdapter } from './infrastructure/adapters/out/nvidia/nvidia-ia.adapter';
import { UsoTokensIaService } from './infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { QuestoesModule } from '../questoes/questoes.module';
import { MetricasModule } from '../metricas/metricas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule, QuestoesModule, MetricasModule],
  controllers: [IaTutorController],
  providers: [
    EnviarMensagemTutorUseCase,
    ExplicarErroUseCase,
    PedirDicaQuestaoUseCase,
    ObterSaldoTokensUseCase,
    UsoTokensIaService,
    GeminiIaAdapter,
    NvidiaIaAdapter,
    IaEngineRouter,
    {
      provide: IA_ENGINE,
      useExisting: IaEngineRouter,
    },
  ],
  exports: [IA_ENGINE],
})
export class IaTutorModule {}
