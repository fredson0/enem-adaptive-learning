import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'idempotent';

export type IdempotentOptions = {
  /** Se true, retorna 400 quando o header Idempotency-Key estiver ausente. */
  required?: boolean;
};

/** Marca rota para deduplicação via header `Idempotency-Key`. */
export const Idempotent = (options: IdempotentOptions = { required: true }) =>
  SetMetadata(IDEMPOTENT_KEY, options);
