import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class GoldApiScheduler implements OnModuleInit {
  private readonly logger = new Logger(GoldApiScheduler.name);

  onModuleInit() {
    this.logger.log('GoldAPI scheduler idle — shop rates are synchronized from KJPL only');
  }
}
