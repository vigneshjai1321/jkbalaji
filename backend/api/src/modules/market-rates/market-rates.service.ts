import { Injectable } from '@nestjs/common';
import type { PublicMarketRatesDto } from '../goldapi/goldapi.types.js';
import { KjplService } from '../kjpl/kjpl.service.js';

export type MarketRatesSource = 'kjpl';

@Injectable()
export class MarketRatesService {
  constructor(private readonly kjpl: KjplService) {}

  activeSource(): MarketRatesSource {
    return 'kjpl';
  }

  async getPublicMarketRates(): Promise<PublicMarketRatesDto> {
    return this.kjpl.getPublicMarketRates();
  }
}
