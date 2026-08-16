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
      ...extrairTermosBuscaPdf(assuntoCatalogo?.nome),
    ].filter((termo, index, lista) => lista.indexOf(termo) === index);

    const quantidade = Math.min(Math.max(input.quantidade ?? 5, 1), 15);
    const incluirGabarito = input.incluirGabarito ?? true;

    let questoes = input.questaoIds?.length
      ? await this.questoesRepository.buscarPorIds(input.questaoIds)
      : await this.questoesRepository.buscarAleatorias({
          area,
          termosBusca: termosBusca.length ? termosBusca : undefined,
          quantidade,
        });

    if (questoes.length === 0) {
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
}
