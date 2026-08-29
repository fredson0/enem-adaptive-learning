import { SetMetadata } from '@nestjs/common';
import type { RoleUsuario } from '../../modules/usuarios/core/domain/entities/usuario.entity';

export const ROLES_KEY = 'roles';

/** Exige papel no JWT assinado pelo servidor. Use junto com JwtAuthGuard. */
export const Roles = (...roles: RoleUsuario[]) => SetMetadata(ROLES_KEY, roles);
