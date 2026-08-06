import {
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

  /** Recalcula proficiência a partir de todas as respostas (útil após migração). */
  @Post('recalcular')
  recalcular(@CurrentUser() user: JwtPayload) {
    return this.calcularProficienciaUseCase.execute(user.sub);
  }
}
