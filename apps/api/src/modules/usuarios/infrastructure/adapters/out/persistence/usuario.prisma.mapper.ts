import type { Usuario as PrismaUsuario } from '@generated/prisma';
import {
  RoleUsuario,
  Usuario,
} from '../../../../core/domain/entities/usuario.entity';

export class UsuarioPrismaMapper {
  static toDomain(row: PrismaUsuario): Usuario {
    return Usuario.criar({
      id: row.id,
      nome: row.nome,
      email: row.email,
      fotoUrl: row.fotoUrl,
      role: row.role as RoleUsuario,
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
    });
  }
}
