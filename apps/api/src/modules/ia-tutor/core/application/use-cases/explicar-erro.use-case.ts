import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import { buildExplicarErroUserPrompt } from '../helpers/tutor-prompts';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';

export type ExplicarErroInput = {
  userId: string;
  questaoId: string;
  alternativaMarcada: string;
  perguntaExtra?: string;
};

@Injectable()
export class ExplicarErroUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
  ) {}

  async execute(input: ExplicarErroInput) {
    const questao = await this.questoesRepository.buscarPorId(input.questaoId);
    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    const perfil = await this.usuariosRepository.obterPerfilAluno(input.userId);
    const tokens = await this.usoTokens.consumir(input.userId);

    const texto = buildExplicarErroUserPrompt(
      {
        enunciado: questao.contexto,
        alternativas: questao.alternativas,
        gabarito: questao.gabarito,
        alternativaMarcada: input.alternativaMarcada.toUpperCase(),
        area: questao.area,
        disciplina: questao.disciplina,
      },
      input.perguntaExtra,
    );

    const resposta = await this.iaEngine.enviarMensagem({
      texto,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
    });

    return {
      resposta,
      questaoId: questao.id,
      tokens,
    };
  }
}
