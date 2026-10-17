import { Module } from '@nestjs/common';
import { KjplService } from './kjpl.service.js';
import { KjplScheduler } from './kjpl.scheduler.js';
import { KjplAdminController } from './kjpl-admin.controller.js';
import { KjplAlertsService } from './kjpl-alerts.service.js';

@Module({
  providers: [KjplService, KjplScheduler, KjplAlertsService],
  controllers: [KjplAdminController],
  exports: [KjplService, KjplAlertsService],
})
export class KjplModule {}
