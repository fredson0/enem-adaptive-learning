import { Inject, Injectable } from '@nestjs/common';
import {
  DEPOIMENTOS_REPOSITORY,
  type DepoimentosRepositoryPort,
  type MeuDepoimentoResponse,
} from '../ports/depoimentos.repository.port';

@Injectable()
export class ObterMeuDepoimentoUseCase {
  constructor(
    @Inject(DEPOIMENTOS_REPOSITORY)
    private readonly depoimentosRepository: DepoimentosRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<MeuDepoimentoResponse> {
    const depoimento =
      await this.depoimentosRepository.buscarPorUsuarioId(usuarioId);

    if (!depoimento) {
      return { depoimento: null };
    }

    return {
      depoimento: {
        id: depoimento.id,
        texto: depoimento.texto,
        papel: depoimento.papel,
        criadoEm: depoimento.criadoEm.toISOString(),
      },
    };
  }
}
