import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import {
  EnviarRespostaUseCase,
  FinalizarSimuladoUseCase,
} from '../../../../core/application/use-cases/enviar-resposta.use-case';
import { GerarSimuladoUseCase } from '../../../../core/application/use-cases/gerar-simulado.use-case';
import {
  ListarSimuladosUseCase,
  ObterSimuladoUseCase,
} from '../../../../core/application/use-cases/obter-simulado.use-case';
import { CriarSimuladoDto, EnviarRespostaDto } from './dto/simulados.dto';

@Controller('simulados')
@UseGuards(JwtAuthGuard)
export class SimuladosController {
  constructor(
    private readonly gerarSimuladoUseCase: GerarSimuladoUseCase,
    private readonly listarSimuladosUseCase: ListarSimuladosUseCase,
    private readonly obterSimuladoUseCase: ObterSimuladoUseCase,
    private readonly enviarRespostaUseCase: EnviarRespostaUseCase,
    private readonly finalizarSimuladoUseCase: FinalizarSimuladoUseCase,
  ) {}

  @Post()
  criar(@CurrentUser() user: JwtPayload, @Body() dto: CriarSimuladoDto) {
    return this.gerarSimuladoUseCase.execute({
      userId: user.sub,
      area: dto.areaEnum ?? undefined,
      ano: dto.ano,
      quantidade: dto.quantidade,
    });
  }

  @Get()
  listar(@CurrentUser() user: JwtPayload) {
    return this.listarSimuladosUseCase.execute(user.sub);
  }

  @Get(':id')
  async obter(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const resultado = await this.obterSimuladoUseCase.execute(id, user.sub);

    return {
      id: resultado.simulado.id,
      area: resultado.simulado.area,
      totalQuestoes: resultado.simulado.totalQuestoes,
      respondidas: resultado.simulado.respondidas,
      acertos: resultado.simulado.acertos,
      status: resultado.simulado.status,
      questaoAtualIdx: resultado.indiceAtual,
      iniciadoEm: resultado.simulado.iniciadoEm,
      finalizadoEm: resultado.simulado.finalizadoEm,
      concluido: resultado.concluido,
      questaoAtual: resultado.questaoAtual?.toPublico() ?? null,
      respostas: resultado.respostas,
    };
  }

  @Post(':id/respostas')
  @HttpCode(200)
  responder(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: EnviarRespostaDto,
  ) {
    return this.enviarRespostaUseCase.execute({
      simuladoId: id,
      userId: user.sub,
      questaoId: dto.questaoId,
      alternativa: dto.alternativa,
    });
  }

  @Post(':id/finalizar')
  @HttpCode(200)
  finalizar(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.finalizarSimuladoUseCase.execute(id, user.sub);
  }
}
