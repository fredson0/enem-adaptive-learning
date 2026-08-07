import { Inject, Injectable } from '@nestjs/common';
import { buildConversaTitulo } from '../helpers/conversa-title.helper';
import type { MensagemHistorico } from '../ports/ia-engine.port';
import {
  CONVERSAS_TUTOR_REPOSITORY,
  type ConversasTutorRepositoryPort,
} from '../ports/conversas-tutor.repository.port';

export type CriarConversaInput = {
  userId: string;
  mensagens?: MensagemHistorico[];
};

@Injectable()
export class CriarConversaUseCase {
  constructor(
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
  ) {}

  async execute(input: CriarConversaInput) {
    const mensagens = input.mensagens ?? [];
    const titulo =
      mensagens.length > 0
        ? buildConversaTitulo(mensagens)
        : 'Nova conversa';

    const { id } = await this.conversasRepository.criar(input.userId, titulo);

    if (mensagens.length > 0) {
      await this.conversasRepository.adicionarMensagens(id, mensagens);
    }

    const conversa = await this.conversasRepository.obterPorId(
      input.userId,
      id,
    );

    return conversa!;
  }
}
