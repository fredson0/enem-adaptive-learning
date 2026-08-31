import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

const DIAS_RETENCAO_REFRESH_REVOGADO = 30;

@Injectable()
export class DatabaseCleanupService {
  private readonly logger = new Logger(DatabaseCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async limparRegistrosExpirados() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const agora = new Date();
    const limiteRefreshRevogado = new Date(
      agora.getTime() - DIAS_RETENCAO_REFRESH_REVOGADO * 24 * 60 * 60 * 1000,
    );

    const [idempotency, refreshExpirados, refreshRevogados] = await Promise.all([
      this.prisma.idempotencyKey.deleteMany({
        where: { expiresAt: { lt: agora } },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: agora } },
      }),
      this.prisma.refreshToken.deleteMany({
        where: {
          revokedAt: { not: null, lt: limiteRefreshRevogado },
        },
      }),
    ]);

    if (
      idempotency.count > 0 ||
      refreshExpirados.count > 0 ||
      refreshRevogados.count > 0
    ) {
      this.logger.log(
        `Limpeza DB: idempotency=${idempotency.count}, refresh_expirados=${refreshExpirados.count}, refresh_revogados=${refreshRevogados.count}`,
      );
    }
  }
}
