import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Rota acessível sem JWT (health, login BFF, depoimentos públicos). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
