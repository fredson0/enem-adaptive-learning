import { Usuario } from '../../domain/entities/usuario.entity';

export const AUTH_TOKEN_SERVICE = Symbol('AUTH_TOKEN_SERVICE');

export interface AuthTokenServicePort {
  gerarToken(usuario: Usuario): Promise<string>;
}
