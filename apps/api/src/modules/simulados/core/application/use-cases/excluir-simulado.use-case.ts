import { Inject, Injectable } from '@nestjs/common';
import {
  SIMULADOS_REPOSITORY,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

@Injectable()
export class ExcluirSimuladoUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
  ) {}

  async execute(simuladoId: string, userId: string) {
    await this.simuladosRepository.excluir(simuladoId, userId);
    return { ok: true };
  }
}
