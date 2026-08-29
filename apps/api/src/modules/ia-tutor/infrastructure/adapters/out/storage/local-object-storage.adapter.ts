import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  ArquivoStorage,
  ObjectStoragePort,
  PresignUploadInput,
  PresignUploadResult,
} from '../../../../core/application/ports/object-storage.port';

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class LocalObjectStorageAdapter implements ObjectStoragePort {
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;
  private readonly apiBaseUrl: string;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.uploadDir = path.resolve(
      process.cwd(),
      this.config.get<string>('LOCAL_UPLOAD_DIR') ?? './.uploads',
    );
    this.publicBaseUrl =
      this.config.get<string>('LOCAL_UPLOAD_BASE_URL') ??
      'http://localhost:3001/api/backend/dev-uploads';
    this.apiBaseUrl =
      this.config.get<string>('API_PUBLIC_URL') ?? 'http://localhost:3333';
  }

  private extensao(contentType: string, fileName?: string) {
    if (fileName?.includes('.')) {
      return fileName.split('.').pop()!.toLowerCase();
    }
    return MIME_EXT[contentType] ?? 'jpg';
  }

  private caminhoAbsoluto(key: string) {
    const normalizado = key.replace(/\\/g, '/');
    if (normalizado.includes('..')) {
      throw new Error('Chave de upload inválida');
    }
    return path.join(this.uploadDir, normalizado);
  }

  async gerarPresignUpload(
    input: PresignUploadInput,
  ): Promise<PresignUploadResult> {
    const ext = this.extensao(input.contentType, input.fileName);
    const fileName = `${randomUUID()}.${ext}`;
    const key = `${input.userId}/${fileName}`;
    const uploadUrl = `${this.apiBaseUrl}/ia-tutor/anexos/upload/${input.userId}/${fileName}`;
    const publicUrl = `${this.publicBaseUrl}/${key}`;

    return {
      key,
      uploadUrl,
      publicUrl,
      headers: {
        'Content-Type': input.contentType,
      },
    };
  }

  async salvarUpload(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const destino = this.caminhoAbsoluto(key);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, buffer);

    const metaPath = `${destino}.meta.json`;
    await writeFile(
      metaPath,
      JSON.stringify({ contentType, key }),
      'utf8',
    );
  }

  async obterArquivo(key: string): Promise<ArquivoStorage | null> {
    try {
      const destino = this.caminhoAbsoluto(key);
      const buffer = await readFile(destino);
      let contentType = 'image/jpeg';

      try {
        const meta = JSON.parse(
          await readFile(`${destino}.meta.json`, 'utf8'),
        ) as { contentType?: string };
        if (meta.contentType) contentType = meta.contentType;
      } catch {
        const ext = path.extname(key).slice(1).toLowerCase();
        contentType =
          Object.entries(MIME_EXT).find(([, value]) => value === ext)?.[0] ??
          'image/jpeg';
      }

      return { buffer, contentType };
    } catch {
      return null;
    }
  }

  resolverKeyDeUrl(url: string): string | null {
    const base = this.publicBaseUrl.replace(/\/$/, '');
    if (!url.startsWith(base)) return null;
    return url.slice(base.length + 1);
  }
}
