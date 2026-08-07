import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CONVERSAS_TUTOR_REPOSITORY,
  type ConversasTutorRepositoryPort,
} from '../ports/conversas-tutor.repository.port';

@Injectable()
export class ObterConversaUseCase {
  constructor(
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
  ) {}

  async execute(userId: string, conversaId: string) {
    const conversa = await this.conversasRepository.obterPorId(
      userId,
      conversaId,
    );

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return conversa;
  }
}
