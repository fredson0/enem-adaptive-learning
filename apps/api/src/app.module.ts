import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { MetricasModule } from './modules/metricas/metricas.module';
import { QuestoesModule } from './modules/questoes/questoes.module';
import { SimuladosModule } from './modules/simulados/simulados.module';
import { DepoimentosModule } from './modules/depoimentos/depoimentos.module';
import { IaTutorModule } from './modules/ia-tutor/ia-tutor.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { SecurityModule } from './infrastructure/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: Number(config.get('THROTTLE_TTL_MS') ?? 60_000),
          limit: Number(config.get('THROTTLE_LIMIT') ?? 100),
        },
      ],
    }),
    PrismaModule,
    SecurityModule,
    UsuariosModule,
    QuestoesModule,
    SimuladosModule,
    IaTutorModule,
    MetricasModule,
    DepoimentosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
