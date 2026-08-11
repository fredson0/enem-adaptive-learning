import { Inject, Injectable } from '@nestjs/common';
import { AreaEnem, StatusSimulado } from '@generated/prisma';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import type {
  EstatisticaAreaBruta,
  MetricasRepositoryPort,
  PontoEvolucaoBruto,
  ResumoSimuladosBruto,
  UltimoSimuladoBruto,
} from '../../../../core/application/ports/metricas.repository.port';
import {
  parseTrilhaEstado,
  type TrilhaEstado,
} from '../../../../core/application/helpers/trilha.config';

@Injectable()
export class PrismaMetricasRepository implements MetricasRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async agregarPorArea(userId: string): Promise<EstatisticaAreaBruta[]> {
    const rows = await this.prisma.respostaSimulado.groupBy({
      by: ['questaoId'],
      where: {
        simulado: { userId },
      },
      _count: { _all: true },
    });

    if (rows.length === 0) {
      return [];
    }

    const questaoIds = rows.map((r) => r.questaoId);
    const questoes = await this.prisma.questao.findMany({
      where: { id: { in: questaoIds } },
      select: { id: true, area: true },
    });
    const areaPorQuestao = new Map(questoes.map((q) => [q.id, q.area]));

    const respostas = await this.prisma.respostaSimulado.findMany({
      where: {
        simulado: { userId },
        questaoId: { in: questaoIds },
      },
      select: { questaoId: true, correto: true },
    });

    const acumulo = new Map<AreaEnem, { total: number; acertos: number }>();

    for (const resposta of respostas) {
      const area = areaPorQuestao.get(resposta.questaoId);
      if (!area) continue;

      const atual = acumulo.get(area) ?? { total: 0, acertos: 0 };
      atual.total += 1;
      if (resposta.correto) atual.acertos += 1;
      acumulo.set(area, atual);
    }

    return [...acumulo.entries()].map(([area, stats]) => ({
      area,
      totalQuestoes: stats.total,
      acertos: stats.acertos,
    }));
  }

  async upsertProficiencia(
    userId: string,
    area: AreaEnem,
    totalQuestoes: number,
    acertos: number,
    score: number,
  ) {
    await this.prisma.proficienciaArea.upsert({
      where: { userId_area: { userId, area } },
      create: {
        userId,
        area,
        totalQuestoes,
        acertos,
        score,
      },
      update: {
        totalQuestoes,
        acertos,
        score,
      },
    });
  }

  async listarProficiencias(userId: string) {
    const rows = await this.prisma.proficienciaArea.findMany({
      where: { userId },
      orderBy: { score: 'asc' },
    });

    return rows.map((row) => ({
      area: row.area as AreaEnem,
      score: Number(row.score),
      totalQuestoes: row.totalQuestoes,
      acertos: row.acertos,
      atualizadoEm: row.atualizadoEm,
    }));
  }

  async listarEvolucao(userId: string, limit = 10): Promise<PontoEvolucaoBruto[]> {
    const rows = await this.prisma.simulado.findMany({
      where: {
        userId,
        status: StatusSimulado.CONCLUIDO,
        finalizadoEm: { not: null },
      },
      orderBy: { finalizadoEm: 'desc' },
      take: limit,
      select: {
        id: true,
        area: true,
        acertos: true,
        totalQuestoes: true,
        finalizadoEm: true,
      },
    });

    return rows
      .filter((row) => row.finalizadoEm)
      .map((row) => ({
        simuladoId: row.id,
        area: row.area,
        acertos: row.acertos,
        totalQuestoes: row.totalQuestoes,
        finalizadoEm: row.finalizadoEm!,
      }))
      .reverse();
  }

  async obterUltimoSimulado(userId: string): Promise<UltimoSimuladoBruto | null> {
    const row = await this.prisma.simulado.findFirst({
      where: {
        userId,
        status: StatusSimulado.CONCLUIDO,
      },
      orderBy: { finalizadoEm: 'desc' },
      select: {
        id: true,
        area: true,
        acertos: true,
        totalQuestoes: true,
        finalizadoEm: true,
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      area: row.area,
      acertos: row.acertos,
      totalQuestoes: row.totalQuestoes,
      finalizadoEm: row.finalizadoEm,
    };
  }

  async obterResumoSimulados(userId: string): Promise<ResumoSimuladosBruto> {
    const concluidos = await this.prisma.simulado.findMany({
      where: { userId, status: StatusSimulado.CONCLUIDO },
      select: { acertos: true, totalQuestoes: true, respondidas: true },
    });

    const questoesRespondidas = concluidos.reduce(
      (sum, s) => sum + s.respondidas,
      0,
    );
    const totalAcertos = concluidos.reduce((sum, s) => sum + s.acertos, 0);
    const totalQuestoes = concluidos.reduce(
      (sum, s) => sum + s.totalQuestoes,
      0,
    );

    return {
      simuladosConcluidos: concluidos.length,
      questoesRespondidas,
      mediaGeralPercentual:
        totalQuestoes > 0
          ? Math.round((totalAcertos / totalQuestoes) * 1000) / 10
          : null,
    };
  }

  async obterTrilhaEstado(userId: string): Promise<TrilhaEstado | null> {
    const perfil = await this.prisma.perfilAluno.findUnique({
      where: { userId },
      select: { trilhaEstado: true },
    });

    if (!perfil?.trilhaEstado) {
      return null;
    }

    return parseTrilhaEstado(perfil.trilhaEstado);
  }

  async salvarTrilhaEstado(userId: string, estado: TrilhaEstado): Promise<void> {
    await this.prisma.perfilAluno.upsert({
      where: { userId },
      create: {
        userId,
        trilhaEstado: estado,
      },
      update: {
        trilhaEstado: estado,
      },
    });
  }

  async obterTempoDiarioMinutos(userId: string): Promise<number> {
    const perfil = await this.prisma.perfilAluno.findUnique({
      where: { userId },
      select: { tempoDiarioMinutos: true },
    });

    return perfil?.tempoDiarioMinutos ?? 120;
  }
}
