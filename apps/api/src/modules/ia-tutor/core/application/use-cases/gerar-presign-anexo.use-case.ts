import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '../ports/object-storage.port';

const TIPOS_PERMITIDOS = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export type GerarPresignAnexoInput = {
  userId: string;
  contentType: string;
  fileName?: string;
};

@Injectable()
export class GerarPresignAnexoUseCase {
  constructor(
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  execute(input: GerarPresignAnexoInput) {
    if (!TIPOS_PERMITIDOS.has(input.contentType)) {
      throw new BadRequestException(
        'Formato não suportado. Use JPEG, PNG ou WebP.',
      );
    }

    return this.storage.gerarPresignUpload({
      userId: input.userId,
      contentType: input.contentType,
      fileName: input.fileName,
    });
  }
}
