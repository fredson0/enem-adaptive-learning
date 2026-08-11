import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { CalcularProficienciaUseCase } from '../../../../core/application/use-cases/calcular-proficiencia.use-case';
import {
  ObterEvolucaoUseCase,
  ObterLacunasUseCase,
  ObterProficienciaUseCase,
} from '../../../../core/application/use-cases/obter-metricas.use-case';
import {
  ObterTrilhaUseCase,
  SalvarDiagnosticoTrilhaUseCase,
} from '../../../../core/application/use-cases/obter-trilha.use-case';
import { SalvarDiagnosticoTrilhaDto } from './dto/trilha.dto';

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
  ) {}

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
      autoAvaliacao: dto.autoAvaliacaoNormalizada,
      disciplinasFracas: dto.disciplinasFracas,
      metaEnem: dto.metaEnem,
    });
  }

  /** Recalcula proficiência a partir de todas as respostas (útil após migração). */
  @Post('recalcular')
  recalcular(@CurrentUser() user: JwtPayload) {
    return this.calcularProficienciaUseCase.execute(user.sub);
  }
}
