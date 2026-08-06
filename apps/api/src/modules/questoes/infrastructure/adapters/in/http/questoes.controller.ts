import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { BuscarQuestoesFiltroUseCase } from '../../../../core/application/use-cases/buscar-questoes-filtro.use-case';
import { BuscarQuestoesQueryDto } from './dto/buscar-questoes.dto';

@Controller('questoes')
@UseGuards(JwtAuthGuard)
export class QuestoesController {
  constructor(
    @Inject(BuscarQuestoesFiltroUseCase)
    private readonly buscarQuestoesFiltroUseCase: BuscarQuestoesFiltroUseCase,
  ) {}

  @Get()
  buscar(@Query() query: BuscarQuestoesQueryDto) {
    return this.buscarQuestoesFiltroUseCase.execute({
      area: query.areaEnum ?? undefined,
      ano: query.ano,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
