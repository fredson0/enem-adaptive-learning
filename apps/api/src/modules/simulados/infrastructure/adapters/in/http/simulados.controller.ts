import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
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
import { GerarSimuladoComIaUseCase } from '../../../../core/application/use-cases/gerar-simulado-com-ia.use-case';
import { ListarSimuladosUseCase } from '../../../../core/application/use-cases/listar-simulados.use-case';
import { ObterSimuladoUseCase } from '../../../../core/application/use-cases/obter-simulado.use-case';
import { ExcluirSimuladoUseCase } from '../../../../core/application/use-cases/excluir-simulado.use-case';
import { RefazerErrosSimuladoUseCase } from '../../../../core/application/use-cases/refazer-erros-simulado.use-case';
import {
  CriarSimuladoDto,
  EnviarRespostaDto,
  GerarSimuladoComIaDto,
  ListarSimuladosQueryDto,
} from './dto/simulados.dto';
import { parseModoSimulado } from '../../../../core/application/helpers/modo-simulado.config';

@Controller('simulados')
@UseGuards(JwtAuthGuard)
export class SimuladosController {
  constructor(
    @Inject(GerarSimuladoUseCase)
    private readonly gerarSimuladoUseCase: GerarSimuladoUseCase,
    @Inject(GerarSimuladoComIaUseCase)
    private readonly gerarSimuladoComIaUseCase: GerarSimuladoComIaUseCase,
    @Inject(ListarSimuladosUseCase)
    private readonly listarSimuladosUseCase: ListarSimuladosUseCase,
    @Inject(ObterSimuladoUseCase)
    private readonly obterSimuladoUseCase: ObterSimuladoUseCase,
    @Inject(EnviarRespostaUseCase)
    private readonly enviarRespostaUseCase: EnviarRespostaUseCase,
    @Inject(FinalizarSimuladoUseCase)
    private readonly finalizarSimuladoUseCase: FinalizarSimuladoUseCase,
    @Inject(ExcluirSimuladoUseCase)
    private readonly excluirSimuladoUseCase: ExcluirSimuladoUseCase,
    @Inject(RefazerErrosSimuladoUseCase)
    private readonly refazerErrosSimuladoUseCase: RefazerErrosSimuladoUseCase,
  ) {}

  @Post()
  criar(@CurrentUser() user: JwtPayload, @Body() dto: CriarSimuladoDto) {
    return this.gerarSimuladoUseCase.execute({
      userId: user.sub,
      modo: parseModoSimulado(dto.modo),
      area: dto.areaEnum ?? undefined,
      ano: dto.anos?.length ? undefined : dto.ano,
      anos: dto.anos,
      termosBusca: dto.termosBusca,
      quantidade: dto.quantidade,
      priorizarNaoDominadas: dto.priorizarNaoDominadas ?? false,
    });
  }

  @Post('gerar-com-ia')
  gerarComIa(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GerarSimuladoComIaDto,
  ) {
    return this.gerarSimuladoComIaUseCase.execute({
      userId: user.sub,
      pedido: dto.pedido,
      modo: parseModoSimulado(dto.modo),
    });
  }

  @Get()
  listar(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListarSimuladosQueryDto,
    @Query('modo') modoQuery?: string,
  ) {
    return this.listarSimuladosUseCase.execute({
      userId: user.sub,
      modo: modoQuery ? parseModoSimulado(modoQuery) : undefined,
      area: query.areaEnum ?? undefined,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get(':id/resultado')
  obterResultado(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.finalizarSimuladoUseCase.execute(id, user.sub);
  }

  @Get(':id')
  async obter(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('ordem') ordem?: string,
  ) {
    const ordemNum =
      ordem !== undefined && ordem !== '' ? Number.parseInt(ordem, 10) : undefined;

    const resultado = await this.obterSimuladoUseCase.execute({
      simuladoId: id,
      userId: user.sub,
      ordem: ordemNum,
    });

    return {
      id: resultado.simulado.id,
      area: resultado.simulado.area,
      modo: resultado.simulado.modo,
      revelarGabaritoImediato: resultado.simulado.revelarGabaritoImediato,
      tempoLimiteSegundos: resultado.simulado.tempoLimiteSegundos,
      totalQuestoes: resultado.simulado.totalQuestoes,
      respondidas: resultado.simulado.respondidas,
      acertos: resultado.simulado.acertos,
      status: resultado.simulado.status,
      questaoAtualIdx: resultado.indiceAtual,
      indiceProgresso: resultado.indiceProgresso,
      iniciadoEm: resultado.simulado.iniciadoEm,
      finalizadoEm: resultado.simulado.finalizadoEm,
      concluido: resultado.concluido,
      questaoAtual: resultado.questaoAtual?.toPublico() ?? null,
      respostas: resultado.respostas,
      navegacao: resultado.navegacao,
      modoVisualizacao: resultado.modoVisualizacao,
      respostaAtual: resultado.respostaAtual,
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

  @Post(':id/refazer-erros')
  refazerErros(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.refazerErrosSimuladoUseCase.execute(id, user.sub);
  }

  @Delete(':id')
  @HttpCode(200)
  excluir(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.excluirSimuladoUseCase.execute(id, user.sub);
  }
}
