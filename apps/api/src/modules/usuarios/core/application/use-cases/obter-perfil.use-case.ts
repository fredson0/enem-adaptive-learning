import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../ports/usuarios.repository.port';

@Injectable()
export class ObterPerfilUseCase {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
  ) {}

  async execute(userId: string) {
    const usuario = await this.usuariosRepository.buscarPorId(userId);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const perfil = await this.usuariosRepository.obterPerfilAluno(userId);

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      fotoUrl: usuario.fotoUrl,
      role: usuario.role,
      perfil: perfil ?? {
        cursoObjetivo: null,
        nivelAtual: 'INICIANTE',
        tempoDiarioMinutos: 120,
        onboardingCompleto: false,
      },
    };
  }
}
