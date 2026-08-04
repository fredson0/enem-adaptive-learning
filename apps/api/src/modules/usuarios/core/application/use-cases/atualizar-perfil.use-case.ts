import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../ports/usuarios.repository.port';

export type AtualizarPerfilInput = {
  nome?: string;
  cursoObjetivo?: string;
  nivelAtual?: string;
  tempoDiarioMinutos?: number;
};

@Injectable()
export class AtualizarPerfilUseCase {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
  ) {}

  async execute(userId: string, input: AtualizarPerfilInput) {
    const usuario = await this.usuariosRepository.buscarPorId(userId);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.usuariosRepository.atualizarPerfilAluno(userId, input);
  }
}
