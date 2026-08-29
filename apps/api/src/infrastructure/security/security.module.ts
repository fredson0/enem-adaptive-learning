import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/roles.guard';
import { IdempotencyInterceptor } from '../http/idempotency.interceptor';
import { IdempotencyService } from '../http/idempotency.service';

@Global()
@Module({
  providers: [
    IdempotencyService,
    {
      provide: APP_GUARD,
      inject: [Reflector],
      useFactory: (reflector: Reflector) => new RolesGuard(reflector),
    },
    {
      provide: APP_INTERCEPTOR,
      inject: [Reflector, IdempotencyService],
      useFactory: (reflector: Reflector, idempotency: IdempotencyService) =>
        new IdempotencyInterceptor(reflector, idempotency),
    },
  ],
  exports: [IdempotencyService],
})
export class SecurityModule {}
