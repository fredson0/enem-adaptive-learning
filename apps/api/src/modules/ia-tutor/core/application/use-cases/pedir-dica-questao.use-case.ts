import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import {
  buildDicaQuestaoUserPrompt,
  buildTutorSystemPrompt,
  detectarAreaEnem,
} from '../helpers/tutor-prompts';
import { sanitizarRespostaTutor } from '../helpers/tutor-formato.helper';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { ObterContextoTutorUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';

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
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
    @Inject(ObterContextoTutorUseCase)
    private readonly obterContextoTutorUseCase: ObterContextoTutorUseCase,
  ) {}

  async execute(input: PedirDicaInput) {
    const questao = await this.questoesRepository.buscarPorId(input.questaoId);
    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    const perfil = await this.usuariosRepository.obterPerfilAluno(input.userId);
    const nivel = perfil?.nivelAtual ?? 'INICIANTE';
    const contextoMetricas = await this.obterContextoTutorUseCase.execute(
      input.userId,
    );
    const tokens = await this.usoTokens.consumir(input.userId);

    const contextoQuestao = {
      enunciado: questao.contexto,
      alternativas: questao.alternativas,
      gabarito: questao.gabarito,
      area: questao.area,
      disciplina: questao.disciplina,
    };

    const texto = buildDicaQuestaoUserPrompt(contextoQuestao, nivel);

    const resposta = sanitizarRespostaTutor(
      await this.iaEngine.enviarMensagem({
        texto,
        nivelAluno: nivel,
        contextoMetricas,
        areaEnem: detectarAreaEnem(questao.disciplina) ?? questao.area,
        systemPromptOverride: buildTutorSystemPrompt(nivel, contextoMetricas, undefined, {
          areaEnem: questao.area,
          incluirProduto: false,
        }),
      }),
    );

    return {
      resposta,
      questaoId: questao.id,
      tokens,
    };
  }
}
