import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CONVERSAS_TUTOR_REPOSITORY,
  type ConversasTutorRepositoryPort,
} from '../ports/conversas-tutor.repository.port';

export type AtualizarConversaInput = {
  userId: string;
  conversaId: string;
  titulo?: string;
};

@Injectable()
export class AtualizarConversaUseCase {
  constructor(
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
  ) {}

  async execute(input: AtualizarConversaInput) {
    const conversa = await this.conversasRepository.obterPorId(
      input.userId,
      input.conversaId,
    );

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    const titulo = input.titulo?.trim();
    if (!titulo) {
      throw new BadRequestException('Título inválido.');
    }

    await this.conversasRepository.atualizarTitulo(input.conversaId, titulo);

    return { ok: true, titulo };
  }
}
