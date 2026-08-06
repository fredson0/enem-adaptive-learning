import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@Injectable()
export class UsoTokensIaService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async consumir(userId: string, custo = 1) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const plano = await this.prisma.planoAssinatura.findUnique({
      where: { userId },
    });
    const limite = plano?.tokensDiarios ?? 10;

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
        restantes: criado.limite - criado.consumo,
      };
    }

    if (existente.consumo >= existente.limite) {
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
      restantes: atualizado.limite - atualizado.consumo,
    };
  }
}
