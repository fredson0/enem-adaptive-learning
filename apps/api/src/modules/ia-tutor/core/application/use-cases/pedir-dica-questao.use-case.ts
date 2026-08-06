import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import { buildDicaQuestaoUserPrompt } from '../helpers/tutor-prompts';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';

export type PedirDicaInput = {
  userId: string;
  questaoId: string;
};

@Injectable()
export class PedirDicaQuestaoUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
  ) {}

  async execute(input: PedirDicaInput) {
    const questao = await this.questoesRepository.buscarPorId(input.questaoId);
    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    const tokens = await this.usoTokens.consumir(input.userId);

    const texto = buildDicaQuestaoUserPrompt({
      enunciado: questao.contexto,
      alternativas: questao.alternativas,
      gabarito: questao.gabarito,
      area: questao.area,
      disciplina: questao.disciplina,
    });

    const resposta = await this.iaEngine.enviarMensagem({ texto });

    return {
      resposta,
      questaoId: questao.id,
      tokens,
    };
  }
}
