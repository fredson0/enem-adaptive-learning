import { Inject, Injectable } from '@nestjs/common';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import { ObterContextoTutorUseCase } from '../../../../metricas/core/application/use-cases/obter-metricas.use-case';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort, MensagemHistorico } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';

export type EnviarMensagemTutorInput = {
  userId: string;
  mensagem: string;
  historico?: MensagemHistorico[];
};

@Injectable()
export class EnviarMensagemTutorUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
    @Inject(ObterContextoTutorUseCase)
    private readonly obterContextoTutorUseCase: ObterContextoTutorUseCase,
  ) {}

  async execute(input: EnviarMensagemTutorInput) {
    const perfil = await this.usuariosRepository.obterPerfilAluno(input.userId);
    const contextoMetricas = await this.obterContextoTutorUseCase.execute(
      input.userId,
    );
    const tokens = await this.usoTokens.consumir(input.userId);

    const resposta = await this.iaEngine.enviarMensagem({
      texto: input.mensagem,
      historico: input.historico,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
      contextoMetricas,
    });

    return {
      resposta,
      tokens,
    };
  }
}
