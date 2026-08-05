import type { Questao as QuestaoRow } from '@generated/prisma';
import { Questao } from '../../../../core/domain/entities/questao.entity';

type AlternativaJson = { letra: string; texto: string };

export class QuestaoPrismaMapper {
  static toDomain(row: QuestaoRow): Questao {
    const alternativas = (row.alternativas as AlternativaJson[]) ?? [];

    return Questao.criar({
      id: row.id,
      enemDevId: row.enemDevId,
      ano: row.ano,
      area: row.area,
      indice: row.indice,
      disciplina: row.disciplina,
      contexto: row.contexto,
      introducaoAlternativas: row.introducaoAlternativas,
      alternativas,
      gabarito: row.gabarito,
      imagemUrl: row.imagemUrl,
    });
  }
}
