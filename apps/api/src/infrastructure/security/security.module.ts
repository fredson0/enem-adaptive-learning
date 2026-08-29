import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from '../auth/roles.guard';
import { IdempotencyInterceptor } from '../http/idempotency.interceptor';
import { IdempotencyService } from '../http/idempotency.service';

@Global()
@Module({
  providers: [
    IdempotencyService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
  exports: [IdempotencyService],
})
export class SecurityModule {}
