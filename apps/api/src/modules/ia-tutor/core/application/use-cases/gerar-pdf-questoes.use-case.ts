import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { QUESTOES_REPOSITORY } from '../../../../questoes/core/application/ports/questoes.repository.port';
import type { QuestoesRepositoryPort } from '../../../../questoes/core/application/ports/questoes.repository.port';
import { parseAreaEnem } from '../../../../questoes/core/application/helpers/area-enem';
import { AREA_LABELS } from '../../../../questoes/core/application/helpers/area-enem';
import { getAssuntoById } from '../../../../metricas/core/application/helpers/trilha-assuntos.catalog';
import {
  extrairTermosBuscaPdf,
  montarTituloPdfQuestoes,
} from '../helpers/pdf-questoes.helper';

export type GerarPdfQuestoesInput = {
  userId: string;
  assuntoId?: string;
  assuntoNome?: string;
  areaSlug?: string;
  conteudoBase?: string;
  termosBusca?: string[];
  quantidade?: number;
  questaoIds?: string[];
  incluirGabarito?: boolean;
};

@Injectable()
export class GerarPdfQuestoesUseCase {
  constructor(
    @Inject(QUESTOES_REPOSITORY)
    private readonly questoesRepository: QuestoesRepositoryPort,
  ) {}

  async execute(input: GerarPdfQuestoesInput) {
    const assuntoCatalogo = input.assuntoId
      ? getAssuntoById(input.assuntoId)
      : undefined;

    const area =
      parseAreaEnem(input.areaSlug ?? assuntoCatalogo?.areaSlug ?? '') ??
      undefined;

    const termosBusca = [
      ...(input.termosBusca ?? []),
      ...extrairTermosBuscaPdf(input.assuntoNome),
      ...extrairTermosBuscaPdf(input.conteudoBase),
      ...extrairTermosBuscaPdf(assuntoCatalogo?.nome),
    ].filter((termo, index, lista) => lista.indexOf(termo) === index);

    const quantidade = Math.min(Math.max(input.quantidade ?? 5, 1), 15);
    const incluirGabarito = input.incluirGabarito ?? true;

    let questoes = input.questaoIds?.length
      ? await this.questoesRepository.buscarPorIds(input.questaoIds)
      : await this.buscarQuestoesComFallback({
          area,
          termosBusca,
          quantidade,
        });

    if (questoes.length === 0) {
      const totalBanco = await this.questoesRepository.contar();
      if (totalBanco === 0) {
        throw new BadRequestException(
          'O banco de questões ainda está vazio. Peça ao administrador para rodar o seed (npm run prisma:seed -w apps/api).',
        );
      }

      throw new BadRequestException(
        'Não encontramos questões para esse tema. Tente outro assunto ou área.',
      );
    }

    if (!input.questaoIds?.length && questoes.length > quantidade) {
      questoes = questoes.slice(0, quantidade);
    }

    const assuntoNome =
      input.assuntoNome?.trim() ||
      assuntoCatalogo?.nome ||
      (termosBusca.length ? termosBusca.join(', ') : 'ENEM');

    const titulo = montarTituloPdfQuestoes({
      assuntoNome,
      termosBusca,
      quantidade: questoes.length,
    });

    return {
      titulo,
      assuntoNome,
      areaSlug: input.areaSlug ?? assuntoCatalogo?.areaSlug ?? null,
      incluirGabarito,
      questoes: questoes.map((questao) => ({
        id: questao.id,
        ano: questao.ano,
        indice: questao.indice,
        area: questao.area,
        areaLabel: AREA_LABELS[questao.area],
        disciplina: questao.disciplina,
        contexto: questao.contexto,
        introducaoAlternativas: questao.introducaoAlternativas,
        alternativas: questao.alternativas,
        imagemUrl: questao.imagemUrl,
        gabarito: questao.gabarito,
      })),
    };
  }

  private async buscarQuestoesComFallback(input: {
    area?: ReturnType<typeof parseAreaEnem>;
    termosBusca: string[];
    quantidade: number;
  }) {
    const tentativas: {
      area?: ReturnType<typeof parseAreaEnem>;
      termosBusca?: string[];
    }[] = [
      {
        area: input.area,
        termosBusca: input.termosBusca.length ? input.termosBusca : undefined,
      },
      { area: input.area },
      { termosBusca: input.termosBusca.length ? input.termosBusca : undefined },
      {},
    ];

    for (const filtro of tentativas) {
      const questoes = await this.questoesRepository.buscarAleatorias({
        area: filtro.area ?? undefined,
        termosBusca: filtro.termosBusca,
        quantidade: input.quantidade,
      });

      if (questoes.length > 0) {
        return questoes;
      }
    }

    return [];
  }
}
