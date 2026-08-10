import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StatusSimulado } from '@generated/prisma';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import type {
  ListarSimuladosFiltro,
  SimuladoDetalhe,
  SimuladosRepositoryPort,
} from '../../../../core/application/ports/simulados.repository.port';

@Injectable()
export class PrismaSimuladosRepository implements SimuladosRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private mapDetalhe(
    row: Awaited<ReturnType<typeof this.loadSimulado>>,
  ): SimuladoDetalhe {
    if (!row) {
      throw new NotFoundException('Simulado não encontrado');
    }

    return {
      id: row.id,
      userId: row.userId,
      area: row.area,
      modo: row.modo,
      revelarGabaritoImediato: row.revelarGabaritoImediato,
      tempoLimiteSegundos: row.tempoLimiteSegundos,
      totalQuestoes: row.totalQuestoes,
      respondidas: row.respondidas,
      acertos: row.acertos,
      status: row.status,
      questaoAtualIdx: row.questaoAtualIdx,
      iniciadoEm: row.iniciadoEm,
      finalizadoEm: row.finalizadoEm,
      questaoIds: row.questoes
        .sort((a, b) => a.ordem - b.ordem)
        .map((sq) => sq.questaoId),
      respostas: row.respostas.map((r) => ({
        questaoId: r.questaoId,
        alternativa: r.alternativa,
        correto: r.correto,
        respondidoEm: r.respondidoEm,
      })),
    };
  }

  private loadSimulado(id: string, userId?: string) {
    return this.prisma.simulado.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
      include: {
        questoes: true,
        respostas: true,
      },
    });
  }

  async criar(input: {
    userId: string;
    area: SimuladoDetalhe['area'];
    questaoIds: string[];
    modo: SimuladoDetalhe['modo'];
    revelarGabaritoImediato: boolean;
    tempoLimiteSegundos: number | null;
  }): Promise<SimuladoDetalhe> {
    const row = await this.prisma.simulado.create({
      data: {
        userId: input.userId,
        area: input.area ?? undefined,
        modo: input.modo,
        revelarGabaritoImediato: input.revelarGabaritoImediato,
        tempoLimiteSegundos: input.tempoLimiteSegundos ?? undefined,
        totalQuestoes: input.questaoIds.length,
        questoes: {
          create: input.questaoIds.map((questaoId, ordem) => ({
            questaoId,
            ordem,
          })),
        },
      },
      include: {
        questoes: true,
        respostas: true,
      },
    });

    return this.mapDetalhe(row);
  }

  async listarPorUsuario(
    userId: string,
    filtro: ListarSimuladosFiltro = {},
  ) {
    const limit = Math.min(Math.max(filtro.limit ?? 50, 1), 100);
    const offset = Math.max(filtro.offset ?? 0, 0);

    const where = {
      userId,
      ...(filtro.modo ? { modo: filtro.modo } : {}),
      ...(filtro.status ? { status: filtro.status } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.simulado.findMany({
        where,
        orderBy: { iniciadoEm: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.simulado.count({ where }),
    ]);

    return {
      total,
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        area: row.area,
        modo: row.modo,
        revelarGabaritoImediato: row.revelarGabaritoImediato,
        tempoLimiteSegundos: row.tempoLimiteSegundos,
        totalQuestoes: row.totalQuestoes,
        respondidas: row.respondidas,
        acertos: row.acertos,
        status: row.status,
        questaoAtualIdx: row.questaoAtualIdx,
        iniciadoEm: row.iniciadoEm,
        finalizadoEm: row.finalizadoEm,
      })),
    };
  }

  async buscarPorId(id: string, userId: string): Promise<SimuladoDetalhe | null> {
    const row = await this.loadSimulado(id, userId);
    return row ? this.mapDetalhe(row) : null;
  }

  async registrarResposta(input: {
    simuladoId: string;
    userId: string;
    questaoId: string;
    alternativa: string;
    correto: boolean;
  }): Promise<SimuladoDetalhe> {
    const existente = await this.prisma.respostaSimulado.findUnique({
      where: {
        simuladoId_questaoId: {
          simuladoId: input.simuladoId,
          questaoId: input.questaoId,
        },
      },
    });

    if (existente) {
      const row = await this.loadSimulado(input.simuladoId, input.userId);
      return this.mapDetalhe(row);
    }

    await this.prisma.$transaction(async (tx) => {
      const simulado = await tx.simulado.findFirst({
        where: { id: input.simuladoId, userId: input.userId },
      });

      if (!simulado) {
        throw new NotFoundException('Simulado não encontrado');
      }

      await tx.respostaSimulado.create({
        data: {
          simuladoId: input.simuladoId,
          questaoId: input.questaoId,
          alternativa: input.alternativa,
          correto: input.correto,
        },
      });

      const novaRespondidas = simulado.respondidas + 1;
      const novosAcertos = simulado.acertos + (input.correto ? 1 : 0);
      const proximoIdx = Math.min(
        simulado.questaoAtualIdx + 1,
        simulado.totalQuestoes,
      );

      await tx.simulado.update({
        where: { id: input.simuladoId },
        data: {
          respondidas: novaRespondidas,
          acertos: novosAcertos,
          questaoAtualIdx: proximoIdx,
        },
      });
    });

    const row = await this.loadSimulado(input.simuladoId, input.userId);
    return this.mapDetalhe(row);
  }

  async finalizar(simuladoId: string, userId: string): Promise<SimuladoDetalhe> {
    await this.prisma.simulado.updateMany({
      where: { id: simuladoId, userId, status: StatusSimulado.EM_ANDAMENTO },
      data: {
        status: StatusSimulado.CONCLUIDO,
        finalizadoEm: new Date(),
      },
    });

    const row = await this.loadSimulado(simuladoId, userId);
    return this.mapDetalhe(row);
  }
}
