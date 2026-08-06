import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { EnviarMensagemTutorUseCase } from '../../../../core/application/use-cases/enviar-mensagem-tutor.use-case';
import { ExplicarErroUseCase } from '../../../../core/application/use-cases/explicar-erro.use-case';
import { PedirDicaQuestaoUseCase } from '../../../../core/application/use-cases/pedir-dica-questao.use-case';
import { ObterSaldoTokensUseCase } from '../../../../core/application/use-cases/obter-saldo-tokens.use-case';
import {
  EnviarMensagemTutorDto,
  ExplicarErroDto,
  PedirDicaDto,
} from './dto/ia-tutor.dto';

@Controller('ia-tutor')
@UseGuards(JwtAuthGuard)
export class IaTutorController {
  constructor(
    @Inject(EnviarMensagemTutorUseCase)
    private readonly enviarMensagemUseCase: EnviarMensagemTutorUseCase,
    @Inject(ExplicarErroUseCase)
    private readonly explicarErroUseCase: ExplicarErroUseCase,
    @Inject(PedirDicaQuestaoUseCase)
    private readonly pedirDicaQuestaoUseCase: PedirDicaQuestaoUseCase,
    @Inject(ObterSaldoTokensUseCase)
    private readonly obterSaldoTokensUseCase: ObterSaldoTokensUseCase,
  ) {}

  @Get('tokens')
  obterSaldo(@CurrentUser() user: JwtPayload) {
    return this.obterSaldoTokensUseCase.execute(user.sub);
  }

  @Post('mensagens')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  enviarMensagem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: EnviarMensagemTutorDto,
  ) {
    return this.enviarMensagemUseCase.execute({
      userId: user.sub,
      mensagem: dto.mensagem,
      historico: dto.historico,
    });
  }

  @Post('explicar-erro')
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  explicarErro(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ExplicarErroDto,
  ) {
    return this.explicarErroUseCase.execute({
      userId: user.sub,
      questaoId: dto.questaoId,
      alternativaMarcada: dto.alternativaMarcada,
      perguntaExtra: dto.perguntaExtra,
    });
  }

  @Post('dica')
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  pedirDica(@CurrentUser() user: JwtPayload, @Body() dto: PedirDicaDto) {
    return this.pedirDicaQuestaoUseCase.execute({
      userId: user.sub,
      questaoId: dto.questaoId,
    });
  }
}
