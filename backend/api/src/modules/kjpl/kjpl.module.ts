import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { KjplService } from './kjpl.service.js';
import { KjplScheduler } from './kjpl.scheduler.js';
import { KjplAdminController } from './kjpl-admin.controller.js';
import { KjplAlertsService } from './kjpl-alerts.service.js';

@Module({
  imports: [AuthModule],
  providers: [KjplService, KjplScheduler, KjplAlertsService],
  controllers: [KjplAdminController],
  exports: [KjplService, KjplAlertsService],
})
export class KjplModule {}
