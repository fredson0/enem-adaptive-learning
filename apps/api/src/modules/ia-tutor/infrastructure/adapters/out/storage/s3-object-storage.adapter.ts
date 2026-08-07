import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
export class S3ObjectStorageAdapter implements ObjectStoragePort {
  private client: S3Client | null = null;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private getClient(): S3Client {
    if (this.client) return this.client;

    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const region = this.config.get<string>('S3_REGION') ?? 'auto';

    this.client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY') ?? '',
      },
    });

    return this.client;
  }

  private bucket() {
    return this.config.get<string>('S3_BUCKET_NAME') ?? 'enem-tutor-anexos';
  }

  private publicBaseUrl() {
    return (
      this.config.get<string>('S3_PUBLIC_BASE_URL') ??
      `${this.config.get<string>('S3_ENDPOINT')}/${this.bucket()}`
    ).replace(/\/$/, '');
  }

  private extensao(contentType: string, fileName?: string) {
    if (fileName?.includes('.')) {
      return fileName.split('.').pop()!.toLowerCase();
    }
    return MIME_EXT[contentType] ?? 'jpg';
  }

  async gerarPresignUpload(
    input: PresignUploadInput,
  ): Promise<PresignUploadResult> {
    const ext = this.extensao(input.contentType, input.fileName);
    const key = `${input.userId}/${randomUUID()}.${ext}`;
    const expires = Number(
      this.config.get<string>('S3_PRESIGN_EXPIRES_SEC') ?? 300,
    );

    const command = new PutObjectCommand({
      Bucket: this.bucket(),
      Key: key,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(this.getClient(), command, {
      expiresIn: expires,
    });

    return {
      key,
      uploadUrl,
      publicUrl: `${this.publicBaseUrl()}/${key}`,
      headers: {
        'Content-Type': input.contentType,
      },
    };
  }

  async salvarUpload(): Promise<void> {
    throw new Error(
      'Upload direto via S3 presign — não use salvarUpload no adapter S3',
    );
  }

  async obterArquivo(key: string): Promise<ArquivoStorage | null> {
    try {
      const response = await this.getClient().send(
        new GetObjectCommand({
          Bucket: this.bucket(),
          Key: key,
        }),
      );

      const bytes = await response.Body?.transformToByteArray();
      if (!bytes) return null;

      return {
        buffer: Buffer.from(bytes),
        contentType: response.ContentType ?? 'image/jpeg',
      };
    } catch {
      return null;
    }
  }

  resolverKeyDeUrl(url: string): string | null {
    const base = this.publicBaseUrl();
    if (!url.startsWith(base)) return null;
    return url.slice(base.length + 1);
  }
}
