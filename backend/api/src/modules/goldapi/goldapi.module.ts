import { Global, Module } from '@nestjs/common';
import { GoldApiScheduler } from './goldapi.scheduler.js';
import { GoldApiService } from './goldapi.service.js';

@Global()
@Module({
  providers: [GoldApiService, GoldApiScheduler],
  exports: [GoldApiService],
})
export class GoldApiModule {}
