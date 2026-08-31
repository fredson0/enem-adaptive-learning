import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseCleanupService } from './database-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [DatabaseCleanupService],
})
export class MaintenanceModule {}
