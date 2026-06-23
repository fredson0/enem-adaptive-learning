import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../domain/entities/usuario.entity';
import { AUTH_TOKEN_SERVICE } from '../ports/auth-token.service.port';
import type { AuthTokenServicePort } from '../ports/auth-token.service.port';
import { OAUTH_SERVICE } from '../ports/oauth.service.port';
import type { OAuthServicePort } from '../ports/oauth.service.port';
import { USUARIOS_REPOSITORY } from '../ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../ports/usuarios.repository.port';

@Injectable()
export class LoginGoogleUseCase {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(OAUTH_SERVICE)
    private readonly oauthService: OAuthServicePort,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: AuthTokenServicePort,
  ) {}

  async execute(idToken: string): Promise<string> {
    const googleUser = await this.oauthService.getUserInfo(idToken);

    let usuario = await this.usuariosRepository.buscarPorEmail(
      googleUser.email,
    );

    if (!usuario) {
      const novoUsuario = Usuario.criar({
        nome: googleUser.nome,
        email: googleUser.email,
        fotoUrl: googleUser.fotoUrl ?? null,
      });
      usuario = await this.usuariosRepository.salvar(novoUsuario);
    }

    return this.authTokenService.gerarToken(usuario);
  }
}
