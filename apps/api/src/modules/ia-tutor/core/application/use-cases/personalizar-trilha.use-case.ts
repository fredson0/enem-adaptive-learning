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
  type PlanoIa,
  type TrilhaEstado,
} from '../../../../metricas/core/application/helpers/trilha.config';
import { criarItemChecklist } from '../../../../metricas/core/application/helpers/trilha-progresso.helper';
import { ObterTrilhaUseCase } from '../../../../metricas/core/application/use-cases/obter-trilha.use-case';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../../../../metricas/core/application/ports/metricas.repository.port';
import { IA_ENGINE } from '../ports/ia-engine.port';
import type { IaEnginePort } from '../ports/ia-engine.port';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';
import { extrairJsonPlanoIa } from '../helpers/trilha-tutor.helper';
import { parseAreaEnem } from '../../../../questoes/core/application/helpers/area-enem';
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
    await this.usoTokens.consumir(userId, 1);

    const lacunasDisciplina =
      trilha.lacunasPorDisciplina
        ?.slice(0, 5)
        .map(
          (item) =>
            `${item.disciplina} (${item.erros} erros, ${item.taxaErro}% taxa de erro)`,
        )
        .join('; ') || 'ainda sem dados de simulados';

    const resumoAreas = trilha.areas
      .map(
        (area) =>
          `${area.label}: proficiência ${area.proficienciaReal}%, prioridade ${area.prioridade}`,
      )
      .join(' | ');

    const minutosPorDia = Math.max(
      30,
      Math.round(trilha.tempoDiarioMinutos / 4),
    );

    const prompt = `Você é o tutor IA do ENEM+IA. Crie um plano de estudo semanal personalizado para a trilha do aluno.

Dados:
- Objetivo ENEM: ${trilha.metaEnem ?? 'não informado'}
- Área prioritária: ${foco.label} (${foco.progresso}% da trilha concluída)
- Assuntos fracos na área: ${foco.disciplinasSugeridas.join(', ') || 'não especificados'}
- Lacunas por disciplina (simulados): ${lacunasDisciplina}
- Próxima etapa sugerida: ${foco.proximaEtapa?.titulo ?? 'revisão geral'} — ${foco.proximaEtapa?.descricao ?? ''}
- Proficiência real na área: ${foco.proficienciaReal}%
- Autoavaliação na área: ${foco.autoAvaliacao}/5
- Tempo disponível: ~${minutosPorDia} min/dia
- Panorama das áreas: ${resumoAreas}

Responda APENAS com JSON válido (sem markdown), neste formato:
{
  "metaSemanal": "meta clara da semana (inclua tempo e foco principal)",
  "proximoPasso": "ação concreta para hoje",
  "resumo": "2 frases motivadoras e específicas",
  "checklist": ["micro-objetivo 1", "micro-objetivo 2", "micro-objetivo 3"]
}

Regras:
- Português brasileiro, tom encorajador e direto
- checklist: 4 a 5 itens curtos, acionáveis na plataforma (simulado, tutor, revisão)
- Adapte ao nível ${perfil?.nivelAtual ?? 'INICIANTE'} e ao tempo diário informado
- Não use "é em" antes de disciplinas — use "são X e Y" ou "é X"`;

    const respostaBruta = await this.iaEngine.enviarMensagem({
      texto: prompt,
      nivelAluno: perfil?.nivelAtual ?? 'INICIANTE',
      responseFormat: 'json_object',
      areaEnem: parseAreaEnem(foco.slug) ?? undefined,
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

    const checklistNovos = plano.checklist.map((texto) =>
      criarItemChecklist({
        id: randomUUID(),
        texto,
        areaSlug: foco.slug,
      }),
    );

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
