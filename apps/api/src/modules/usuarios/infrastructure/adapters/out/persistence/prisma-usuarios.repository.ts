import { Inject, Injectable } from '@nestjs/common';
import {
  NivelAluno,
  PlanoTipo,
  RoleUsuario,
  SerieEscolar,
  TipoEnsinoMedio,
} from '@generated/prisma';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { isPerfilOnboardingCompleto } from '../../../../core/application/helpers/perfil-onboarding';
import type {
  PerfilAlunoData,
  UsuariosRepositoryPort,
} from '../../../../core/application/ports/usuarios.repository.port';
import { Usuario } from '../../../../core/domain/entities/usuario.entity';
import { UsuarioPrismaMapper } from './usuario.prisma.mapper';

@Injectable()
export class PrismaUsuariosRepository implements UsuariosRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const row = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!row) {
      return null;
    }

    return UsuarioPrismaMapper.toDomain(row);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const row = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!row) {
      return null;
    }

    return UsuarioPrismaMapper.toDomain(row);
  }

  async salvar(
    usuario: Usuario,
    meta?: { googleSub?: string },
  ): Promise<Usuario> {
    const row = await this.prisma.usuario.upsert({
      where: { email: usuario.email.toLowerCase() },
      create: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email.toLowerCase(),
        fotoUrl: usuario.fotoUrl,
        role: usuario.role as RoleUsuario,
        googleSub: meta?.googleSub,
        perfilAluno: {
          create: {},
        },
        planoAssinatura: {
          create: {
            tipo: PlanoTipo.GRATUITO,
            tokensDiarios: 10,
          },
        },
      },
      update: {
        nome: usuario.nome,
        fotoUrl: usuario.fotoUrl,
        googleSub: meta?.googleSub,
      },
    });

    return UsuarioPrismaMapper.toDomain(row);
  }

  async obterPerfilAluno(userId: string): Promise<PerfilAlunoData | null> {
    const perfil = await this.prisma.perfilAluno.findUnique({
      where: { userId },
    });

    if (!perfil) {
      return null;
    }

    return {
      cursoObjetivo: perfil.cursoObjetivo,
      serieEscolar: perfil.serieEscolar,
      tipoEnsinoMedio: perfil.tipoEnsinoMedio,
      nivelAtual: perfil.nivelAtual,
      tempoDiarioMinutos: perfil.tempoDiarioMinutos,
      onboardingCompleto: isPerfilOnboardingCompleto(perfil),
    };
  }

  async obterPlanoAssinatura(userId: string) {
    const plano = await this.prisma.planoAssinatura.findUnique({
      where: { userId },
    });

    if (!plano) {
      return null;
    }

    return {
      tipo: plano.tipo,
      tokensDiarios: plano.tokensDiarios,
      ativo: plano.ativo,
    };
  }

  async atualizarPerfilAluno(
    userId: string,
    data: {
      nome?: string;
      fotoUrl?: string | null;
      cursoObjetivo?: string;
      serieEscolar?: string;
      tipoEnsinoMedio?: string;
      nivelAtual?: string;
      tempoDiarioMinutos?: number;
    },
  ) {
    const usuarioRow = await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(data.nome ? { nome: data.nome } : {}),
        ...(data.fotoUrl !== undefined ? { fotoUrl: data.fotoUrl } : {}),
      },
    });

    const perfilRow = await this.prisma.perfilAluno.upsert({
      where: { userId },
      create: {
        userId,
        cursoObjetivo: data.cursoObjetivo,
        serieEscolar: data.serieEscolar as SerieEscolar | undefined,
        tipoEnsinoMedio: data.tipoEnsinoMedio as TipoEnsinoMedio | undefined,
        nivelAtual: (data.nivelAtual as NivelAluno) ?? NivelAluno.INICIANTE,
        tempoDiarioMinutos: data.tempoDiarioMinutos ?? 120,
      },
      update: {
        ...(data.cursoObjetivo !== undefined
          ? { cursoObjetivo: data.cursoObjetivo }
          : {}),
        ...(data.serieEscolar !== undefined
          ? { serieEscolar: data.serieEscolar as SerieEscolar }
          : {}),
        ...(data.tipoEnsinoMedio !== undefined
          ? { tipoEnsinoMedio: data.tipoEnsinoMedio as TipoEnsinoMedio }
          : {}),
        ...(data.nivelAtual
          ? { nivelAtual: data.nivelAtual as NivelAluno }
          : {}),
        ...(data.tempoDiarioMinutos !== undefined
          ? { tempoDiarioMinutos: data.tempoDiarioMinutos }
          : {}),
      },
    });

    return {
      usuario: UsuarioPrismaMapper.toDomain(usuarioRow),
      perfil: {
        cursoObjetivo: perfilRow.cursoObjetivo,
        serieEscolar: perfilRow.serieEscolar,
        tipoEnsinoMedio: perfilRow.tipoEnsinoMedio,
        nivelAtual: perfilRow.nivelAtual,
        tempoDiarioMinutos: perfilRow.tempoDiarioMinutos,
        onboardingCompleto: isPerfilOnboardingCompleto(perfilRow),
      },
    };
  }
}
