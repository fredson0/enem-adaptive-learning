import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../../../../../infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import type { JwtPayload } from '../../../../../../infrastructure/auth/jwt-auth.guard';
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '../../../../core/application/ports/object-storage.port';

@Controller('dev-uploads')
export class DevUploadsController {
  constructor(
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  @Get(':userId/:file')
  @UseGuards(JwtAuthGuard)
  async servir(
    @CurrentUser() user: JwtPayload,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    if (user.sub !== userId) {
      throw new ForbiddenException('Acesso negado ao anexo');
    }

    const key = `${userId}/${file}`;
    const arquivo = await this.storage.obterArquivo(key);

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    res.setHeader('Content-Type', arquivo.contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(arquivo.buffer);
  }
}
