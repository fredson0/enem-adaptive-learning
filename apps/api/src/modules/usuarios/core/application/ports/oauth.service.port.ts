export const OAUTH_SERVICE = Symbol('OAUTH_SERVICE');

export interface GoogleUserInfo {
  email: string;
  nome: string;
  fotoUrl?: string | null;
  googleSub?: string;
}

export interface OAuthServicePort {
  getUserInfo(idToken: string): Promise<GoogleUserInfo>;
}
