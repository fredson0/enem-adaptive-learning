import { Inject, Injectable } from '@nestjs/common';
import {
  DEPOIMENTOS_MOCK,
  mesclarDepoimentosComMocks,
  type DepoimentoItem,
} from '../../domain/depoimentos.mock';
import {
  DEPOIMENTOS_REPOSITORY,
  type DepoimentoPublicoResponse,
  type DepoimentosRepositoryPort,
} from '../ports/depoimentos.repository.port';

@Injectable()
export class ListarDepoimentosPublicosUseCase {
  constructor(
    @Inject(DEPOIMENTOS_REPOSITORY)
    private readonly depoimentosRepository: DepoimentosRepositoryPort,
  ) {}

  async execute(): Promise<DepoimentoPublicoResponse> {
    const registros = await this.depoimentosRepository.listarAprovadosOrdenados();

    const reais: DepoimentoItem[] = registros.map((registro) => ({
      quote: registro.texto,
      author: registro.usuario.nome,
      role: registro.papel?.trim() || 'Estudante ENEM+',
      isReal: true,
    }));

    const depoimentos = mesclarDepoimentosComMocks(DEPOIMENTOS_MOCK, reais);

    return {
      depoimentos,
      totalReais: reais.length,
      totalMocks: DEPOIMENTOS_MOCK.length,
    };
  }
}
