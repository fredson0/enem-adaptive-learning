import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-auth.guard';
import type { RoleUsuario } from '../../modules/usuarios/core/domain/entities/usuario.entity';

/**
 * RBAC: nunca confiar em role enviada pelo cliente — só o JWT assinado pelo servidor.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowed: RoleUsuario[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const role = request.user?.role as RoleUsuario | undefined;

    if (!role || !this.allowed.includes(role)) {
      throw new ForbiddenException('Permissão insuficiente');
    }

    return true;
  }
}

/** Factory helper: @UseGuards(JwtAuthGuard, Roles('ADMIN')) — use RolesGuard with module provider or SetMetadata pattern later. */
export function rolesAllowed(...roles: RoleUsuario[]) {
  return new RolesGuard(roles);
}
