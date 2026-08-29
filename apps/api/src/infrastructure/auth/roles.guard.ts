import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-auth.guard';
import type { RoleUsuario } from '../../modules/usuarios/core/domain/entities/usuario.entity';
import { ROLES_KEY } from './roles.decorator';

/**
 * RBAC: nunca confiar em role enviada pelo cliente — só o JWT assinado pelo servidor.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<RoleUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowed?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const role = request.user?.role as RoleUsuario | undefined;

    if (!role || !allowed.includes(role)) {
      throw new ForbiddenException('Permissão insuficiente');
    }

    return true;
  }
}
