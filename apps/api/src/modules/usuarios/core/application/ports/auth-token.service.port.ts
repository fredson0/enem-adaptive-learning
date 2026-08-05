import { Usuario } from '../../domain/entities/usuario.entity';

export const AUTH_TOKEN_SERVICE = Symbol('AUTH_TOKEN_SERVICE');

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

export interface AuthTokenServicePort {
  /** Access JWT curto (padrão 15 min). */
  gerarAccessToken(usuario: Usuario): Promise<string>;

  /** Emite par access + refresh (refresh opaco, hash no banco). */
  emitirParTokens(usuario: Usuario): Promise<TokenPair>;

  /** Rotaciona refresh (revoga o antigo, emite novo par). */
  rotacionarRefreshToken(rawRefreshToken: string): Promise<RefreshResult>;

  /** Revoga um refresh token (logout). */
  revogarRefreshToken(rawRefreshToken: string): Promise<void>;

  /** Revoga todos os refresh tokens do usuário (logout global). */
  revogarTodosDoUsuario(userId: string): Promise<void>;

  /** @deprecated use gerarAccessToken / emitirParTokens */
  gerarToken(usuario: Usuario): Promise<string>;
}
