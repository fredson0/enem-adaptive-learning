import {
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
import type { IaEnginePort } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { extrairJsonPlanoIa } from '../helpers/trilha-tutor.helper';
@Injectable()
export class PersonalizarTrilhaUseCase {
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

  async execute(userId: string) {
    const trilha = await this.obterTrilhaUseCase.execute(userId);

    if (!trilha.diagnosticoCompleto) {
      throw new ServiceUnavailableException(
        'Complete o diagnóstico antes de personalizar a trilha.',
      );
    }

    const foco = trilha.areas[0];
    if (!foco) {
      throw new ServiceUnavailableException('Trilha indisponível.');
    }

    const perfil = await this.usuariosRepository.obterPerfilAluno(userId);
    await this.usoTokens.consumir(userId, 2);

    const prompt = `Você é o tutor IA do ENEM+. Crie um plano de estudo personalizado para a trilha do aluno.

Dados:
- Objetivo ENEM: ${trilha.metaEnem ?? 'não informado'}
- Área prioritária: ${foco.label} (${foco.progresso}% concluído)
- Assuntos fracos: ${foco.disciplinasSugeridas.join(', ') || 'não especificados'}
- Próxima etapa sugerida: ${foco.proximaEtapa?.titulo ?? 'revisão geral'}
- Proficiência real: ${foco.proficienciaReal}%
- Autoavaliação: ${foco.autoAvaliacao}/5

Responda APENAS com JSON válido (sem markdown), neste formato:
{
  "metaSemanal": "frase curta com meta da semana em português",
  "proximoPasso": "ação concreta para hoje",
  "resumo": "2 frases motivadoras e específicas",
  "checklist": ["micro-objetivo 1", "micro-objetivo 2", "micro-objetivo 3"]
}

Regras:
- Português brasileiro, tom encorajador
- checklist: 3 a 5 itens curtos, acionáveis, adaptados ao nível ${perfil?.nivelAtual ?? 'INICIANTE'}
- Não use "é em" antes de disciplinas — use "são X e Y" ou "é X"`;

    const respostaBruta = await this.iaEngine.enviarMensagem({
      texto: prompt,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
    });

    const plano = extrairJsonPlanoIa(respostaBruta);
    if (!plano) {
      throw new ServiceUnavailableException(
        'Não foi possível gerar o plano agora. Tente novamente.',
      );
    }

    const estado =
      (await this.metricasRepository.obterTrilhaEstado(userId)) ??
      estadoTrilhaVazio();

    const planoIa: PlanoIa = {
      atualizadoEm: new Date().toISOString(),
      metaSemanal: plano.metaSemanal,
      proximoPasso: plano.proximoPasso,
      areaSlug: foco.slug,
      resumo: plano.resumo,
    };

    const checklistNovos: ChecklistItemIa[] = plano.checklist.map((texto) => ({
      id: randomUUID(),
      texto,
      concluida: false,
      areaSlug: foco.slug,
      criadoEm: new Date().toISOString(),
    }));

    const novoEstado: TrilhaEstado = {
      ...estado,
      planoIa,
      checklistIa: checklistNovos,
    };

    await this.metricasRepository.salvarTrilhaEstado(userId, novoEstado);

    const trilhaAtualizada = await this.obterTrilhaUseCase.execute(userId);

    return {
      ok: true,
      planoIa,
      trilha: trilhaAtualizada,
    };
  }
}
