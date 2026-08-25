import { Inject, Injectable } from '@nestjs/common';
import {
  DEPOIMENTOS_REPOSITORY,
  type DepoimentosRepositoryPort,
} from '../ports/depoimentos.repository.port';

type CriarDepoimentoInput = {
  usuarioId: string;
  texto: string;
  papel?: string;
};

@Injectable()
export class CriarDepoimentoUseCase {
  constructor(
    @Inject(DEPOIMENTOS_REPOSITORY)
    private readonly depoimentosRepository: DepoimentosRepositoryPort,
  ) {}

  async execute(input: CriarDepoimentoInput) {
    const depoimento = await this.depoimentosRepository.salvar({
      usuarioId: input.usuarioId,
      texto: input.texto.trim(),
      papel: input.papel?.trim() || null,
    });

    return {
      id: depoimento.id,
      texto: depoimento.texto,
      papel: depoimento.papel,
      criadoEm: depoimento.criadoEm.toISOString(),
    };
  }
}
