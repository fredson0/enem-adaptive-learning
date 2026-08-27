import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SIMULADOS_REPOSITORY,
  type SimuladosRepositoryPort,
} from '../ports/simulados.repository.port';

@Injectable()
export class RefazerErrosSimuladoUseCase {
  constructor(
    @Inject(SIMULADOS_REPOSITORY)
    private readonly simuladosRepository: SimuladosRepositoryPort,
  ) {}

  async execute(simuladoId: string, userId: string) {
    const simulado = await this.simuladosRepository.buscarPorId(simuladoId, userId);

    if (!simulado) {
      throw new NotFoundException('Simulado não encontrado');
    }

    if (simulado.status !== 'CONCLUIDO') {
      throw new BadRequestException('Finalize o simulado antes de refazer os erros');
    }

    const questaoIdsErro = simulado.questaoIds.filter((questaoId) => {
      const resposta = simulado.respostas.find((r) => r.questaoId === questaoId);
      return resposta?.correto === false;
    });

    if (questaoIdsErro.length === 0) {
      throw new BadRequestException('Não há questões erradas para refazer');
    }

    const novo = await this.simuladosRepository.criar({
      userId,
      area: simulado.area,
      questaoIds: questaoIdsErro,
      modo: simulado.modo,
      revelarGabaritoImediato: simulado.revelarGabaritoImediato,
      tempoLimiteSegundos: simulado.tempoLimiteSegundos,
    });

    return { id: novo.id, totalQuestoes: novo.totalQuestoes };
  }
}
