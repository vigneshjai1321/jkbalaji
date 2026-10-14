import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KjplService } from './kjpl.service.js';

@Injectable()
export class KjplScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KjplScheduler.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly kjpl: KjplService) {}

  onModuleInit() {
    if (!this.kjpl.isEnabled()) {
      this.logger.log('KJPL scheduler idle — set KJPL_RATES_ENABLED=true to poll kjpl.in');
      return;
    }
    const minutes = this.kjpl.pollIntervalMinutes();
    const ms = minutes * 60 * 1000;
    void this.kjpl.refreshRates();
    this.timer = setInterval(() => {
      void this.kjpl.refreshRates();
    }, ms);
    this.logger.log(`KJPL scheduler polling every ${minutes} minutes`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
