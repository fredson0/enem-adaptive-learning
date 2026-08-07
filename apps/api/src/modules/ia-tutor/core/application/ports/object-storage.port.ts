export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export type PresignUploadInput = {
  userId: string;
  contentType: string;
  fileName?: string;
};

export type PresignUploadResult = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
};

export type ArquivoStorage = {
  buffer: Buffer;
  contentType: string;
};

export interface ObjectStoragePort {
  gerarPresignUpload(input: PresignUploadInput): Promise<PresignUploadResult>;
  salvarUpload(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void>;
  obterArquivo(key: string): Promise<ArquivoStorage | null>;
  resolverKeyDeUrl(url: string): string | null;
}
