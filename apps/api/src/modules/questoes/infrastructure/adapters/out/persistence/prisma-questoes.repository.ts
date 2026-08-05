import { Inject, Injectable } from '@nestjs/common';
import type { AreaEnem, Prisma } from '@generated/prisma';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import type {
  BuscarQuestoesFiltro,
  BuscarQuestoesResultado,
  QuestoesRepositoryPort,
} from '../../../../core/application/ports/questoes.repository.port';
import { QuestaoPrismaMapper } from './questao.prisma.mapper';

@Injectable()
export class PrismaQuestoesRepository implements QuestoesRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private buildWhere(filtro?: {
    area?: AreaEnem;
    ano?: number;
  }): Prisma.QuestaoWhereInput {
    if (!filtro) return {};
    return {
      ...(filtro.area ? { area: filtro.area } : {}),
      ...(filtro.ano ? { ano: filtro.ano } : {}),
    };
  }

  async buscarComFiltro(filtro: BuscarQuestoesFiltro): Promise<BuscarQuestoesResultado> {
    const where = this.buildWhere({ area: filtro.area, ano: filtro.ano });

    const [rows, total] = await Promise.all([
      this.prisma.questao.findMany({
        where,
        orderBy: [{ ano: 'desc' }, { indice: 'asc' }],
        take: filtro.limit,
        skip: filtro.offset,
      }),
      this.prisma.questao.count({ where }),
    ]);

    return {
      items: rows.map(QuestaoPrismaMapper.toDomain),
      total,
      limit: filtro.limit,
      offset: filtro.offset,
    };
  }

  async buscarAleatorias(filtro: {
    area?: AreaEnem;
    ano?: number;
    quantidade: number;
    excluirIds?: string[];
  }) {
    const where = this.buildWhere({ area: filtro.area, ano: filtro.ano });

    if (filtro.excluirIds?.length) {
      Object.assign(where, { id: { notIn: filtro.excluirIds } });
    }

    const total = await this.prisma.questao.count({ where });

    if (total === 0) {
      return [];
    }

    const take = Math.min(filtro.quantidade, total);
    const maxOffset = Math.max(0, total - take);
    const offset = maxOffset > 0 ? Math.floor(Math.random() * (maxOffset + 1)) : 0;

    const rows = await this.prisma.questao.findMany({
      where,
      skip: offset,
      take,
      orderBy: { id: 'asc' },
    });

    return rows.map(QuestaoPrismaMapper.toDomain);
  }

  async buscarPorId(id: string) {
    const row = await this.prisma.questao.findUnique({ where: { id } });
    return row ? QuestaoPrismaMapper.toDomain(row) : null;
  }

  async buscarPorIds(ids: string[]) {
    if (!ids.length) return [];

    const rows = await this.prisma.questao.findMany({
      where: { id: { in: ids } },
    });

    const map = new Map(rows.map((r) => [r.id, QuestaoPrismaMapper.toDomain(r)]));
    return ids.map((id) => map.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
  }

  async contar(filtro?: { area?: AreaEnem; ano?: number }) {
    return this.prisma.questao.count({ where: this.buildWhere(filtro) });
  }
}
