import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '../../../../core/application/ports/object-storage.port';
import { CriarConversaUseCase } from '../../../../core/application/use-cases/criar-conversa.use-case';
import { EnviarMensagemTutorUseCase } from '../../../../core/application/use-cases/enviar-mensagem-tutor.use-case';
import { ExplicarErroUseCase } from '../../../../core/application/use-cases/explicar-erro.use-case';
import { GerarPresignAnexoUseCase } from '../../../../core/application/use-cases/gerar-presign-anexo.use-case';
import { ListarConversasUseCase } from '../../../../core/application/use-cases/listar-conversas.use-case';
import { ObterConversaUseCase } from '../../../../core/application/use-cases/obter-conversa.use-case';
import { PedirDicaQuestaoUseCase } from '../../../../core/application/use-cases/pedir-dica-questao.use-case';
import { ObterSaldoTokensUseCase } from '../../../../core/application/use-cases/obter-saldo-tokens.use-case';
import {
  CriarConversaDto,
  EnviarMensagemTutorDto,
  ExplicarErroDto,
  PedirDicaDto,
  PresignAnexoDto,
} from './dto/ia-tutor.dto';

@Controller('ia-tutor')
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
    @Inject(ListarConversasUseCase)
    private readonly listarConversasUseCase: ListarConversasUseCase,
    @Inject(ObterConversaUseCase)
    private readonly obterConversaUseCase: ObterConversaUseCase,
    @Inject(CriarConversaUseCase)
    private readonly criarConversaUseCase: CriarConversaUseCase,
    @Inject(GerarPresignAnexoUseCase)
    private readonly gerarPresignAnexoUseCase: GerarPresignAnexoUseCase,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  @Get('tokens')
  @UseGuards(JwtAuthGuard)
  obterSaldo(@CurrentUser() user: JwtPayload) {
    return this.obterSaldoTokensUseCase.execute(user.sub);
  }

  @Get('conversas')
  @UseGuards(JwtAuthGuard)
  listarConversas(@CurrentUser() user: JwtPayload) {
    return this.listarConversasUseCase.execute(user.sub);
  }

  @Get('conversas/:id')
  @UseGuards(JwtAuthGuard)
  obterConversa(
    @CurrentUser() user: JwtPayload,
    @Param('id') conversaId: string,
  ) {
    return this.obterConversaUseCase.execute(user.sub, conversaId);
  }

  @Post('conversas')
  @UseGuards(JwtAuthGuard)
  criarConversa(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CriarConversaDto,
  ) {
    return this.criarConversaUseCase.execute({
      userId: user.sub,
      mensagens: dto.mensagens,
    });
  }

  @Post('anexos/presign')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  presignAnexo(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PresignAnexoDto,
  ) {
    return this.gerarPresignAnexoUseCase.execute({
      userId: user.sub,
      contentType: dto.contentType,
      fileName: dto.fileName,
    });
  }

  @Put('anexos/upload/:userId/:file')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async uploadAnexo(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
    @Param('file') file: string,
    @Headers('content-type') contentType: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (userId !== user.sub) {
      throw new ForbiddenException('Upload não autorizado');
    }

    const key = `${userId}/${file}`;
    const rawBody = req.rawBody ?? req.body;
    const buffer = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(rawBody ?? []);

    if (buffer.length === 0) {
      throw new ForbiddenException('Arquivo vazio');
    }

    await this.storage.salvarUpload(
      key,
      buffer,
      contentType || 'image/jpeg',
    );

    return { ok: true, key };
  }

  @Post('mensagens')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  enviarMensagem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: EnviarMensagemTutorDto,
  ) {
    return this.enviarMensagemUseCase.execute({
      userId: user.sub,
      mensagem: dto.mensagem,
      conversaId: dto.conversaId,
      anexoUrl: dto.anexoUrl,
    });
  }

  @Post('explicar-erro')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  pedirDica(@CurrentUser() user: JwtPayload, @Body() dto: PedirDicaDto) {
    return this.pedirDicaQuestaoUseCase.execute({
      userId: user.sub,
      questaoId: dto.questaoId,
    });
  }
}
