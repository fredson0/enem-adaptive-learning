import { Inject, Injectable } from '@nestjs/common';
import { PapelMensagemTutor } from '@generated/prisma';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import type { MensagemHistorico } from '../../../../core/application/ports/ia-engine.port';
import type {
  ConversaCompleta,
  ConversaResumo,
  ConversasTutorRepositoryPort,
} from '../../../../core/application/ports/conversas-tutor.repository.port';

function toHistoricoRole(papel: PapelMensagemTutor): MensagemHistorico['role'] {
  return papel === PapelMensagemTutor.USER ? 'user' : 'assistant';
}

function toPapel(role: MensagemHistorico['role']): PapelMensagemTutor {
  return role === 'user' ? PapelMensagemTutor.USER : PapelMensagemTutor.ASSISTANT;
}

@Injectable()
export class PrismaConversasTutorRepository implements ConversasTutorRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listar(userId: string): Promise<ConversaResumo[]> {
    const conversas = await this.prisma.conversaTutor.findMany({
      where: { userId },
      orderBy: { atualizadoEm: 'desc' },
      take: 50,
      include: {
        mensagens: {
          orderBy: { ordem: 'desc' },
          take: 1,
        },
      },
    });

    return conversas.map((conversa) => ({
      id: conversa.id,
      titulo: conversa.titulo,
      preview: conversa.mensagens[0]?.texto ?? 'Sem mensagens',
      atualizadoEm: conversa.atualizadoEm,
    }));
  }

  async obterPorId(
    userId: string,
    conversaId: string,
  ): Promise<ConversaCompleta | null> {
    const conversa = await this.prisma.conversaTutor.findFirst({
      where: { id: conversaId, userId },
      include: {
        mensagens: {
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!conversa) return null;

    return {
      id: conversa.id,
      titulo: conversa.titulo,
      atualizadoEm: conversa.atualizadoEm,
      mensagens: conversa.mensagens.map((mensagem) => ({
        role: toHistoricoRole(mensagem.papel),
        texto: mensagem.texto,
        anexoUrl: mensagem.anexoUrl ?? undefined,
      })),
    };
  }

  async criar(userId: string, titulo = 'Nova conversa') {
    const conversa = await this.prisma.conversaTutor.create({
      data: { userId, titulo },
      select: { id: true },
    });

    return conversa;
  }

  async adicionarMensagens(
    conversaId: string,
    mensagens: MensagemHistorico[],
  ): Promise<void> {
    if (mensagens.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      const ultima = await tx.mensagemTutor.findFirst({
        where: { conversaId },
        orderBy: { ordem: 'desc' },
        select: { ordem: true },
      });

      let ordem = ultima?.ordem ?? -1;

      for (const mensagem of mensagens) {
        ordem += 1;
        await tx.mensagemTutor.create({
          data: {
            conversaId,
            papel: toPapel(mensagem.role),
            texto: mensagem.texto,
            anexoUrl: mensagem.anexoUrl,
            ordem,
          },
        });
      }

      await tx.conversaTutor.update({
        where: { id: conversaId },
        data: { atualizadoEm: new Date() },
      });
    });
  }

  async atualizarTitulo(conversaId: string, titulo: string): Promise<void> {
    await this.prisma.conversaTutor.update({
      where: { id: conversaId },
      data: { titulo },
    });
  }
}
