import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  CurrentUser,
  type JwtPayload,
} from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import { CriarDepoimentoUseCase } from '../../../../core/application/use-cases/criar-depoimento.use-case';
import { ListarDepoimentosPublicosUseCase } from '../../../../core/application/use-cases/listar-depoimentos-publicos.use-case';
import { ObterMeuDepoimentoUseCase } from '../../../../core/application/use-cases/obter-meu-depoimento.use-case';
import { CriarDepoimentoDto } from './dto/depoimentos.dto';

@Controller('depoimentos')
export class DepoimentosController {
  constructor(
    @Inject(ListarDepoimentosPublicosUseCase)
    private readonly listarDepoimentosPublicosUseCase: ListarDepoimentosPublicosUseCase,
    @Inject(CriarDepoimentoUseCase)
    private readonly criarDepoimentoUseCase: CriarDepoimentoUseCase,
    @Inject(ObterMeuDepoimentoUseCase)
    private readonly obterMeuDepoimentoUseCase: ObterMeuDepoimentoUseCase,
  ) {}

  @Get('publico')
  listarPublicos() {
    return this.listarDepoimentosPublicosUseCase.execute();
  }

  @Get('meu')
  @UseGuards(JwtAuthGuard)
  obterMeu(@CurrentUser() user: JwtPayload) {
    return this.obterMeuDepoimentoUseCase.execute(user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  criar(@CurrentUser() user: JwtPayload, @Body() dto: CriarDepoimentoDto) {
    return this.criarDepoimentoUseCase.execute({
      usuarioId: user.sub,
      texto: dto.texto,
      papel: dto.papel,
    });
  }
}
