import { Module } from '@nestjs/common';
import { KjplService } from './kjpl.service.js';
import { KjplScheduler } from './kjpl.scheduler.js';
import { KjplAdminController } from './kjpl-admin.controller.js';

@Module({
  providers: [KjplService, KjplScheduler],
  controllers: [KjplAdminController],
  exports: [KjplService],
})
export class KjplModule {}
