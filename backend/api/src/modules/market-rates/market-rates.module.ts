import { Module } from '@nestjs/common';
import { KjplModule } from '../kjpl/kjpl.module.js';
import { MarketRatesService } from './market-rates.service.js';

@Module({
  imports: [KjplModule],
  providers: [MarketRatesService],
  exports: [MarketRatesService],
})
export class MarketRatesModule {}
