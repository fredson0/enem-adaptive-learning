import { Inject, Injectable } from '@nestjs/common';
import { UsoTokensIaService } from '../../../infrastructure/adapters/out/persistence/uso-tokens-ia.service';

@Injectable()
export class ObterSaldoTokensUseCase {
  constructor(
    @Inject(UsoTokensIaService)
    private readonly usoTokens: UsoTokensIaService,
  ) {}

  execute(userId: string) {
    return this.usoTokens.obterSaldo(userId);
  }
}
