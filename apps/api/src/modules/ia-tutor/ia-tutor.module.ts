import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONVERSAS_TUTOR_REPOSITORY } from './core/application/ports/conversas-tutor.repository.port';
import { IA_ENGINE } from './core/application/ports/ia-engine.port';
import { OBJECT_STORAGE } from './core/application/ports/object-storage.port';
import { CriarConversaUseCase } from './core/application/use-cases/criar-conversa.use-case';
import { EnviarMensagemTutorUseCase } from './core/application/use-cases/enviar-mensagem-tutor.use-case';
import { ExplicarErroUseCase } from './core/application/use-cases/explicar-erro.use-case';
import { GerarPresignAnexoUseCase } from './core/application/use-cases/gerar-presign-anexo.use-case';
import { ListarConversasUseCase } from './core/application/use-cases/listar-conversas.use-case';
import { ObterConversaUseCase } from './core/application/use-cases/obter-conversa.use-case';
import { PedirDicaQuestaoUseCase } from './core/application/use-cases/pedir-dica-questao.use-case';
import { ObterSaldoTokensUseCase } from './core/application/use-cases/obter-saldo-tokens.use-case';
import { DevUploadsController } from './infrastructure/adapters/in/http/dev-uploads.controller';
import { IaTutorController } from './infrastructure/adapters/in/http/ia-tutor.controller';
import { GeminiIaAdapter } from './infrastructure/adapters/out/gemini/gemini-ia.adapter';
import { IaEngineRouter } from './infrastructure/adapters/out/ia-engine.router';
import { NvidiaIaAdapter } from './infrastructure/adapters/out/nvidia/nvidia-ia.adapter';
import { PrismaConversasTutorRepository } from './infrastructure/adapters/out/persistence/prisma-conversas-tutor.repository';
import { UsoTokensIaService } from './infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { LocalObjectStorageAdapter } from './infrastructure/adapters/out/storage/local-object-storage.adapter';
import { S3ObjectStorageAdapter } from './infrastructure/adapters/out/storage/s3-object-storage.adapter';
import { QuestoesModule } from '../questoes/questoes.module';
import { MetricasModule } from '../metricas/metricas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule, QuestoesModule, MetricasModule],
  controllers: [IaTutorController, DevUploadsController],
  providers: [
    EnviarMensagemTutorUseCase,
    ExplicarErroUseCase,
    PedirDicaQuestaoUseCase,
    ObterSaldoTokensUseCase,
    ListarConversasUseCase,
    ObterConversaUseCase,
    CriarConversaUseCase,
    GerarPresignAnexoUseCase,
    UsoTokensIaService,
    GeminiIaAdapter,
    NvidiaIaAdapter,
    IaEngineRouter,
    LocalObjectStorageAdapter,
    S3ObjectStorageAdapter,
    {
      provide: IA_ENGINE,
      useExisting: IaEngineRouter,
    },
    {
      provide: CONVERSAS_TUTOR_REPOSITORY,
      useClass: PrismaConversasTutorRepository,
    },
    {
      provide: OBJECT_STORAGE,
      inject: [ConfigService, LocalObjectStorageAdapter, S3ObjectStorageAdapter],
      useFactory: (
        config: ConfigService,
        local: LocalObjectStorageAdapter,
        s3: S3ObjectStorageAdapter,
      ) => {
        const provider = (config.get<string>('STORAGE_PROVIDER') ?? 'local').toLowerCase();
        return provider === 's3' ? s3 : local;
      },
    },
  ],
  exports: [IA_ENGINE],
})
export class IaTutorModule {}
