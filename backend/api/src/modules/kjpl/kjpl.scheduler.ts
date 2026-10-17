import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KjplService } from './kjpl.service.js';
import { KjplAlertsService } from './kjpl-alerts.service.js';

@Injectable()
export class KjplScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KjplScheduler.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly kjpl: KjplService,
    private readonly alerts: KjplAlertsService,
  ) {}

  onModuleInit() {
    if (!this.kjpl.isEnabled()) {
      this.logger.log('KJPL scheduler idle — set KJPL_RATES_ENABLED=true to poll kjpl.in');
      return;
    }
    const minutes = this.kjpl.pollIntervalMinutes();
    const ms = minutes * 60 * 1000;
    void this.scheduleNext(minutes);
    void this.kjpl.refreshRates().finally(() => this.scheduleNext(this.kjpl.pollIntervalMinutes()));
    this.timer = setInterval(() => {
      void this.kjpl.refreshRates().then(() => this.scheduleNext(this.kjpl.pollIntervalMinutes()));
    }, ms);
    this.logger.log(`KJPL scheduler polling every ${minutes} minutes`);
  }

  private async scheduleNext(minutes: number) {
    const next = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await this.alerts.setNextScheduledAt(next);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
