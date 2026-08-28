import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USUARIOS_REPOSITORY,
  type UsuariosRepositoryPort,
} from '../ports/usuarios.repository.port';

const LABELS: Record<string, string> = {
  GRATUITO: 'Gratuito',
  APOIO: 'Apoio',
};

@Injectable()
export class ObterPlanoUseCase {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
  ) {}

  async execute(userId: string) {
    const usuario = await this.usuariosRepository.buscarPorId(userId);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const plano = await this.usuariosRepository.obterPlanoAssinatura(userId);

    return {
      tipo: plano?.tipo ?? 'GRATUITO',
      label: LABELS[plano?.tipo ?? 'GRATUITO'] ?? 'Gratuito',
      tokensDiarios: plano?.tokensDiarios ?? 10,
      ativo: plano?.ativo ?? true,
    };
  }
}
