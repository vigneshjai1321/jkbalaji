import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoldApiService } from '../goldapi/goldapi.service.js';
import type { PublicMarketRatesDto } from '../goldapi/goldapi.types.js';
import { KjplService } from '../kjpl/kjpl.service.js';

export type MarketRatesSource = 'goldapi' | 'kjpl';

@Injectable()
export class MarketRatesService {
  constructor(
    private readonly config: ConfigService,
    private readonly goldApi: GoldApiService,
    private readonly kjpl: KjplService,
  ) {}

  activeSource(): MarketRatesSource {
    const raw = (this.config.get<string>('MARKET_RATES_SOURCE') ?? 'goldapi').toLowerCase();
    return raw === 'kjpl' ? 'kjpl' : 'goldapi';
  }

  async getPublicMarketRates(): Promise<PublicMarketRatesDto> {
    if (this.activeSource() === 'kjpl') {
      return this.kjpl.getPublicMarketRates();
    }
    return this.goldApi.getPublicMarketRates();
  }
}
