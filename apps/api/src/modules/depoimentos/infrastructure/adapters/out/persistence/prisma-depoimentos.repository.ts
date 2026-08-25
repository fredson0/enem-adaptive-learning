import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import type {
  DepoimentoRecord,
  DepoimentosRepositoryPort,
} from '../../../core/application/ports/depoimentos.repository.port';

@Injectable()
export class PrismaDepoimentosRepository implements DepoimentosRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listarAprovadosOrdenados(): Promise<DepoimentoRecord[]> {
    const rows = await this.prisma.depoimento.findMany({
      where: { aprovado: true },
      orderBy: { criadoEm: 'asc' },
      include: {
        usuario: {
          select: { nome: true },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      usuarioId: row.usuarioId,
      texto: row.texto,
      papel: row.papel,
      aprovado: row.aprovado,
      criadoEm: row.criadoEm,
      usuario: { nome: row.usuario.nome },
    }));
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<DepoimentoRecord | null> {
    const row = await this.prisma.depoimento.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: { nome: true },
        },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      usuarioId: row.usuarioId,
      texto: row.texto,
      papel: row.papel,
      aprovado: row.aprovado,
      criadoEm: row.criadoEm,
      usuario: { nome: row.usuario.nome },
    };
  }

  async salvar(input: {
    usuarioId: string;
    texto: string;
    papel?: string | null;
  }): Promise<DepoimentoRecord> {
    const row = await this.prisma.depoimento.upsert({
      where: { usuarioId: input.usuarioId },
      create: {
        usuarioId: input.usuarioId,
        texto: input.texto,
        papel: input.papel ?? null,
      },
      update: {
        texto: input.texto,
        papel: input.papel ?? null,
      },
      include: {
        usuario: {
          select: { nome: true },
        },
      },
    });

    return {
      id: row.id,
      usuarioId: row.usuarioId,
      texto: row.texto,
      papel: row.papel,
      aprovado: row.aprovado,
      criadoEm: row.criadoEm,
      usuario: { nome: row.usuario.nome },
    };
  }
}
