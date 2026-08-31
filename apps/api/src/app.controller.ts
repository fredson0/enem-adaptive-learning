import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from './infrastructure/auth/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
