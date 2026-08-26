import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { CalcularProficienciaUseCase } from '../../../../core/application/use-cases/calcular-proficiencia.use-case';
import { ObterCoberturaUseCase } from '../../../../core/application/use-cases/obter-cobertura.use-case';
import { ObterFrequenciaTemasUseCase } from '../../../../core/application/use-cases/obter-frequencia-temas.use-case';
import {
  ObterEvolucaoUseCase,
  ObterLacunasUseCase,
  ObterProficienciaUseCase,
} from '../../../../core/application/use-cases/obter-metricas.use-case';
import {
  ObterTrilhaUseCase,
  MarcarEtapaTrilhaUseCase,
  MarcarChecklistIaUseCase,
  SalvarDiagnosticoTrilhaUseCase,
} from '../../../../core/application/use-cases/obter-trilha.use-case';
import {
  MarcarChecklistIaDto,
  MarcarEtapaTrilhaDto,
  SalvarDiagnosticoTrilhaDto,
} from './dto/trilha.dto';

@Controller('metricas')
@UseGuards(JwtAuthGuard)
export class MetricasController {
  constructor(
    @Inject(ObterProficienciaUseCase)
    private readonly obterProficienciaUseCase: ObterProficienciaUseCase,
    @Inject(ObterEvolucaoUseCase)
    private readonly obterEvolucaoUseCase: ObterEvolucaoUseCase,
    @Inject(ObterLacunasUseCase)
    private readonly obterLacunasUseCase: ObterLacunasUseCase,
    @Inject(CalcularProficienciaUseCase)
    private readonly calcularProficienciaUseCase: CalcularProficienciaUseCase,
    @Inject(ObterTrilhaUseCase)
    private readonly obterTrilhaUseCase: ObterTrilhaUseCase,
    @Inject(SalvarDiagnosticoTrilhaUseCase)
    private readonly salvarDiagnosticoTrilhaUseCase: SalvarDiagnosticoTrilhaUseCase,
    @Inject(MarcarEtapaTrilhaUseCase)
    private readonly marcarEtapaTrilhaUseCase: MarcarEtapaTrilhaUseCase,
    @Inject(MarcarChecklistIaUseCase)
    private readonly marcarChecklistIaUseCase: MarcarChecklistIaUseCase,
    @Inject(ObterCoberturaUseCase)
    private readonly obterCoberturaUseCase: ObterCoberturaUseCase,
    @Inject(ObterFrequenciaTemasUseCase)
    private readonly obterFrequenciaTemasUseCase: ObterFrequenciaTemasUseCase,
  ) {}

  @Get('frequencia-temas')
  obterFrequenciaTemas(
    @CurrentUser() user: JwtPayload,
    @Query('area') area?: string,
  ) {
    return this.obterFrequenciaTemasUseCase.execute(area);
  }

  @Get('cobertura')
  obterCobertura(@CurrentUser() user: JwtPayload) {
    return this.obterCoberturaUseCase.execute(user.sub);
  }

  @Get('proficiencia')
  obterProficiencia(@CurrentUser() user: JwtPayload) {
    return this.obterProficienciaUseCase.execute(user.sub);
  }

  @Get('evolucao')
  obterEvolucao(@CurrentUser() user: JwtPayload) {
    return this.obterEvolucaoUseCase.execute(user.sub);
  }

  @Get('lacunas')
  obterLacunas(@CurrentUser() user: JwtPayload) {
    return this.obterLacunasUseCase.execute(user.sub);
  }

  @Get('trilha')
  obterTrilha(@CurrentUser() user: JwtPayload) {
    return this.obterTrilhaUseCase.execute(user.sub);
  }

  @Post('trilha/diagnostico')
  salvarDiagnosticoTrilha(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SalvarDiagnosticoTrilhaDto,
  ) {
    return this.salvarDiagnosticoTrilhaUseCase.execute({
      userId: user.sub,
      autoAvaliacao: dto.autoAvaliacao ?? {},
      disciplinasFracas: dto.disciplinasFracas ?? [],
      metaEnem: dto.metaEnem,
    });
  }

  @Post('trilha/etapas')
  marcarEtapaTrilha(
    @CurrentUser() user: JwtPayload,
    @Body() dto: MarcarEtapaTrilhaDto,
  ) {
    return this.marcarEtapaTrilhaUseCase.execute({
      userId: user.sub,
      etapaId: dto.etapaId,
      concluida: dto.concluida,
    });
  }

  @Post('trilha/checklist')
  marcarChecklistIa(
    @CurrentUser() user: JwtPayload,
    @Body() dto: MarcarChecklistIaDto,
  ) {
    return this.marcarChecklistIaUseCase.execute({
      userId: user.sub,
      itemId: dto.itemId,
      concluida: dto.concluida,
    });
  }

  /** Recalcula proficiência a partir de todas as respostas (útil após migração). */
  @Post('recalcular')
  recalcular(@CurrentUser() user: JwtPayload) {
    return this.calcularProficienciaUseCase.execute(user.sub);
  }
}
