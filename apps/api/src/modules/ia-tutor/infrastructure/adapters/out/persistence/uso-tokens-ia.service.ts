import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@Injectable()
export class UsoTokensIaService {
  /** Valor usado como limite ilimitado (plano dev / premium). */
  static readonly LIMITE_ILIMITADO = 999_999;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private startOfToday() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  }

  private isIlimitadoEnv() {
    return (
      process.env.IA_TOKENS_UNLIMITED === 'true' ||
      process.env.NODE_ENV !== 'production'
    );
  }

  private isIlimitado(limite: number) {
    return (
      limite >= UsoTokensIaService.LIMITE_ILIMITADO || this.isIlimitadoEnv()
    );
  }

  private async getLimiteDiario(userId: string) {
    if (this.isIlimitadoEnv()) {
      return UsoTokensIaService.LIMITE_ILIMITADO;
    }
    const plano = await this.prisma.planoAssinatura.findUnique({
      where: { userId },
    });
    return plano?.tokensDiarios ?? 10;
  }

  async obterSaldo(userId: string) {
    const hoje = this.startOfToday();
    const limite = await this.getLimiteDiario(userId);

    const existente = await this.prisma.usoTokenIa.findUnique({
      where: {
        userId_data: { userId, data: hoje },
      },
    });

    const consumo = existente?.consumo ?? 0;

    if (this.isIlimitado(limite)) {
      return {
        consumo,
        limite,
        restantes: limite,
      };
    }

    return {
      consumo,
      limite,
      restantes: Math.max(limite - consumo, 0),
    };
  }

  async consumir(userId: string, custo = 1) {
    const hoje = this.startOfToday();
    const limite = await this.getLimiteDiario(userId);
    const ilimitado = this.isIlimitado(limite);

    const existente = await this.prisma.usoTokenIa.findUnique({
      where: {
        userId_data: { userId, data: hoje },
      },
    });

    if (!existente) {
      const criado = await this.prisma.usoTokenIa.create({
        data: {
          userId,
          data: hoje,
          consumo: custo,
          limite,
        },
      });

      return {
        consumo: criado.consumo,
        limite: criado.limite,
        restantes: ilimitado
          ? criado.limite
          : criado.limite - criado.consumo,
      };
    }

    if (!ilimitado && existente.consumo >= limite) {
      throw new HttpException(
        `Limite diário de ${existente.limite} mensagens IA atingido. Volte amanhã ou faça upgrade do plano.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const atualizado = await this.prisma.usoTokenIa.update({
      where: { id: existente.id },
      data: {
        consumo: { increment: custo },
        limite,
      },
    });

    return {
      consumo: atualizado.consumo,
      limite: atualizado.limite,
      restantes: ilimitado
        ? atualizado.limite
        : atualizado.limite - atualizado.consumo,
    };
  }
}
