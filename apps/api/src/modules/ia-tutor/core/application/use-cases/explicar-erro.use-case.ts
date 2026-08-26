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
  buildExplicarErroUserPrompt,
  buildTutorSystemPrompt,
  montarHrefTrilhaArea,
} from '../helpers/tutor-prompts';
import { sanitizarRespostaTutor } from '../helpers/tutor-formato.helper';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { ObterContextoTutorUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';

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
    @Inject(ObterContextoTutorUseCase)
    private readonly obterContextoTutorUseCase: ObterContextoTutorUseCase,
  ) {}

  async execute(input: ExplicarErroInput) {
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

    const trilhaHref = montarHrefTrilhaArea(questao.area);

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
      trilhaHref,
    );

    const resposta = sanitizarRespostaTutor(
      await this.iaEngine.enviarMensagem({
        texto,
        nivelAluno: nivel,
        contextoMetricas,
        areaEnem: questao.area,
        systemPromptOverride: buildTutorSystemPrompt(nivel, contextoMetricas, undefined, {
          areaEnem: questao.area,
          incluirProduto: false,
          pedidoExplicacao: true,
        }),
      }),
    );

    return {
      resposta,
      questaoId: questao.id,
      tokens,
      trilhaHref,
    };
  }
}
