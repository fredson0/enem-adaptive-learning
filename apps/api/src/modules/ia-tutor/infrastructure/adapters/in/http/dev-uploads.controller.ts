import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
  async servir(
    @Param('userId') userId: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
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
