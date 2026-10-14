import { Module } from '@nestjs/common';
import { GoldApiModule } from '../goldapi/goldapi.module.js';
import { KjplModule } from '../kjpl/kjpl.module.js';
import { MarketRatesService } from './market-rates.service.js';

@Module({
  imports: [GoldApiModule, KjplModule],
  providers: [MarketRatesService],
  exports: [MarketRatesService],
})
export class MarketRatesModule {}
