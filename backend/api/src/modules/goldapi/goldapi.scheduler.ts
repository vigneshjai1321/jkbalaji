import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { GoldApiService } from './goldapi.service.js';
import { msUntilNextIstTime } from './goldapi-ist.js';

@Injectable()
export class GoldApiScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GoldApiScheduler.name);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly goldApi: GoldApiService) {}

  async onModuleInit() {
    await this.goldApi.loadVerificationFromDb();
    if (!this.goldApi.isConfigured()) {
      this.logger.log('GoldAPI scheduler idle — GOLDAPI_ACCESS_TOKEN not set');
      return;
    }
    this.scheduleNext();
    this.logger.log('GoldAPI scheduler armed for 09:00 Asia/Kolkata daily fetch');
  }

  onModuleDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  private scheduleNext() {
    const delay = msUntilNextIstTime(9, 0);
    this.timer = setTimeout(() => {
      void this.runCron();
    }, delay);
  }

  private async runCron() {
    try {
      if (!this.goldApi.isConfigured()) return;
      await this.goldApi.runDailyFetch('cron');
    } catch (e) {
      this.logger.error(`GoldAPI cron error: ${e instanceof Error ? e.message : e}`);
    } finally {
      this.scheduleNext();
    }
  }
}
