import { Injectable } from '@nestjs/common';
import { PlanoTipo, RoleUsuario } from '@generated/prisma';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import type { UsuariosRepositoryPort } from '../../../../core/application/ports/usuarios.repository.port';
import { Usuario } from '../../../../core/domain/entities/usuario.entity';
import { UsuarioPrismaMapper } from './usuario.prisma.mapper';

@Injectable()
export class PrismaUsuariosRepository implements UsuariosRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const row = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!row) {
      return null;
    }

    return UsuarioPrismaMapper.toDomain(row);
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const row = await this.prisma.usuario.upsert({
      where: { email: usuario.email.toLowerCase() },
      create: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email.toLowerCase(),
        fotoUrl: usuario.fotoUrl,
        role: usuario.role as RoleUsuario,
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
      },
    });

    return UsuarioPrismaMapper.toDomain(row);
  }
}
