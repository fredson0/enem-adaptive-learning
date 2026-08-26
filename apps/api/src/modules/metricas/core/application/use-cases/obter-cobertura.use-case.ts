import { Inject, Injectable } from '@nestjs/common';
import {
  ASSUNTOS_CATALOGO,
  buildAssuntoQuestaoWhere,
  montarCoberturaResumo,
  questaoCombinaAssunto,
} from '../helpers/cobertura-questoes.helper';
import {
  AREAS_ENEM,
  labelAreaEnem,
  slugAreaEnem,
} from '../helpers/area-enem-labels';
import {
  METRICAS_REPOSITORY,
  type MetricasRepositoryPort,
} from '../ports/metricas.repository.port';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@Injectable()
export class ObterCoberturaUseCase {
  constructor(
    @Inject(METRICAS_REPOSITORY)
    private readonly metricasRepository: MetricasRepositoryPort,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string) {
    const cobertura = await this.metricasRepository.obterCoberturaBruta(userId);

    const areas = AREAS_ENEM.map((area) => {
      const dominadas = cobertura.dominadas.filter((q) => q.area === area).length;
      const disponiveis = cobertura.disponiveisPorArea[area] ?? 0;
      const tentadas = cobertura.tentadas.filter((q) => q.area === area).length;
      const resumo = montarCoberturaResumo(dominadas, disponiveis, tentadas);

      return {
        area,
        slug: slugAreaEnem(area),
        label: labelAreaEnem(area),
        ...resumo,
        score: resumo.percentual,
      };
    });

    const assuntos = await Promise.all(
      ASSUNTOS_CATALOGO.map(async (assunto) => {
        const disponiveis = await this.prisma.questao.count({
          where: buildAssuntoQuestaoWhere(assunto),
        });

        const dominadas = cobertura.dominadas.filter((questao) =>
          questaoCombinaAssunto(questao, assunto),
        ).length;

        const tentadas = cobertura.tentadas.filter((questao) =>
          questaoCombinaAssunto(questao, assunto),
        ).length;

        return {
          assuntoId: assunto.id,
          nome: assunto.nome,
          areaSlug: assunto.areaSlug,
          ...montarCoberturaResumo(dominadas, disponiveis, tentadas),
        };
      }),
    );

    const anos = cobertura.disponiveisPorAno.map(({ ano, total }) => {
      const dominadas = cobertura.dominadas.filter((q) => q.ano === ano).length;
      const tentadas = cobertura.tentadas.filter((q) => q.ano === ano).length;
      const resumo = montarCoberturaResumo(dominadas, total, tentadas);

      return {
        ano,
        ...resumo,
        completo: resumo.percentual >= 100,
      };
    });

    const progressoPorAssunto = Object.fromEntries(
      assuntos.map((item) => [item.assuntoId, item.percentual]),
    );

    const coberturaPorAssunto = Object.fromEntries(
      assuntos.map((item) => [
        item.assuntoId,
        {
          dominadas: item.dominadas,
          disponiveis: item.disponiveis,
          tentadas: item.tentadas,
          percentual: item.percentual,
        },
      ]),
    );

    return {
      areas,
      assuntos,
      anos,
      progressoPorAssunto,
      coberturaPorAssunto,
    };
  }
}
