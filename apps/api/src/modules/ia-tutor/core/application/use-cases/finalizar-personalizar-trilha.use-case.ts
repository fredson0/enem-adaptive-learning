import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { USUARIOS_REPOSITORY } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import type { UsuariosRepositoryPort } from '../../../../usuarios/core/application/ports/usuarios.repository.port';
import {
  estadoTrilhaVazio,
  type ChecklistItemIa,
  type PlanoIa,
  type TrilhaEstado,
} from '../../../../metricas/core/application/helpers/trilha.config';
import { ObterTrilhaUseCase } from '../../../../metricas/core/application/use-cases/obter-trilha.use-case';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../../../../metricas/core/application/ports/metricas.repository.port';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort, MensagemHistorico } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import {
  extrairJsonPlanoIa,
  formatarHistoricoParaExtracao,
} from '../helpers/trilha-tutor.helper';

export type FinalizarPersonalizarTrilhaInput = {
  userId: string;
  areaSlug: string;
  historico: MensagemHistorico[];
};

@Injectable()
export class FinalizarPersonalizarTrilhaUseCase {
  constructor(
    @Inject(IA_ENGINE) private readonly iaEngine: IaEnginePort,
    @Inject(ObterTrilhaUseCase)
    private readonly obterTrilhaUseCase: ObterTrilhaUseCase,
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: UsuariosRepositoryPort,
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
  ) {}

  async execute(input: FinalizarPersonalizarTrilhaInput) {
    if (!input.historico?.length) {
      throw new BadRequestException(
        'Converse com a IA antes de finalizar o plano.',
      );
    }

    const trilha = await this.obterTrilhaUseCase.execute(input.userId);
    const area = trilha.areas.find((item) => item.slug === input.areaSlug);

    if (!area) {
      throw new BadRequestException('Área inválida.');
    }

    const perfil = await this.usuariosRepository.obterPerfilAluno(input.userId);
    await this.usoTokens.consumir(input.userId, 2);

    const conversa = formatarHistoricoParaExtracao(input.historico);

    const prompt = `Com base na conversa abaixo, monte o plano de estudos personalizado do aluno em ${area.label}.

Conversa:
${conversa}

Responda APENAS com JSON válido (sem markdown):
{
  "metaSemanal": "meta da semana em uma frase",
  "proximoPasso": "ação concreta para hoje",
  "resumo": "2 frases motivadoras baseadas no que o aluno disse",
  "checklist": ["micro-objetivo 1", "micro-objetivo 2", "micro-objetivo 3", "micro-objetivo 4"]
}

Regras:
- checklist: 3 a 6 itens curtos e acionáveis, baseados nas respostas do aluno
- Português brasileiro
- Não use "é em" antes de disciplinas`;

    const respostaBruta = await this.iaEngine.enviarMensagem({
      texto: prompt,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
    });

    const plano = extrairJsonPlanoIa(respostaBruta);
    if (!plano || plano.checklist.length === 0) {
      throw new ServiceUnavailableException(
        'Não foi possível montar a checklist. Continue a conversa e tente de novo.',
      );
    }

    const estado =
      (await this.metricasRepository.obterTrilhaEstado(input.userId)) ??
      estadoTrilhaVazio();

    const planoIa: PlanoIa = {
      atualizadoEm: new Date().toISOString(),
      metaSemanal: plano.metaSemanal,
      proximoPasso: plano.proximoPasso,
      areaSlug: area.slug,
      resumo: plano.resumo,
    };

    const checklistNovos: ChecklistItemIa[] = plano.checklist.map((texto) => ({
      id: randomUUID(),
      texto,
      concluida: false,
      areaSlug: area.slug,
      criadoEm: new Date().toISOString(),
    }));

    const novoEstado: TrilhaEstado = {
      ...estado,
      planoIa,
      checklistIa: checklistNovos,
    };

    await this.metricasRepository.salvarTrilhaEstado(input.userId, novoEstado);

    const trilhaAtualizada = await this.obterTrilhaUseCase.execute(
      input.userId,
    );

    return {
      ok: true,
      planoIa,
      trilha: trilhaAtualizada,
    };
  }
}
