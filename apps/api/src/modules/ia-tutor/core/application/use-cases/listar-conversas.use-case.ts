import { Inject, Injectable } from '@nestjs/common';
import {
  CONVERSAS_TUTOR_REPOSITORY,
  type ConversasTutorRepositoryPort,
} from '../ports/conversas-tutor.repository.port';

@Injectable()
export class ListarConversasUseCase {
  constructor(
    @Inject(CONVERSAS_TUTOR_REPOSITORY)
    private readonly conversasRepository: ConversasTutorRepositoryPort,
  ) {}

  execute(userId: string) {
    return this.conversasRepository.listar(userId);
  }
}
