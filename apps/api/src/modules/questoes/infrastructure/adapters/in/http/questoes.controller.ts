import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { BuscarQuestoesFiltroUseCase } from '../../../../core/application/use-cases/buscar-questoes-filtro.use-case';
import { ContarQuestoesUseCase } from '../../../../core/application/use-cases/contar-questoes.use-case';
import { BuscarQuestoesQueryDto } from './dto/buscar-questoes.dto';
import { ContarQuestoesQueryDto } from './dto/contar-questoes.dto';

@Controller('questoes')
@UseGuards(JwtAuthGuard)
export class QuestoesController {
  constructor(
    @Inject(BuscarQuestoesFiltroUseCase)
    private readonly buscarQuestoesFiltroUseCase: BuscarQuestoesFiltroUseCase,
    @Inject(ContarQuestoesUseCase)
    private readonly contarQuestoesUseCase: ContarQuestoesUseCase,
  ) {}

  @Get('contagem')
  contar(@Query() query: ContarQuestoesQueryDto) {
    return this.contarQuestoesUseCase.execute({
      area: query.areaEnum ?? undefined,
      ano: query.ano,
      anos: query.anos,
      termosBusca: query.termosBusca,
    });
  }

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
