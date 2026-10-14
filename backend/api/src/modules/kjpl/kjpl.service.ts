import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service.js';
import type { PublicMarketRatesDto } from '../goldapi/goldapi.types.js';
import { fetchKjplHomeHtml, KjplFetchError } from './kjpl.client.js';
import { parseKjplMjdtaRates, type KjplParsedRates } from './kjpl-parse.js';

const CACHE_KEY = 'kjpl_rates_cache_v1';
const STALE_AFTER_MS = 45 * 60 * 1000;

type CachedPayload = {
  rates: KjplParsedRates;
  fetchedAt: string;
  sourceUrl: string;
};

@Injectable()
export class KjplService {
  private readonly logger = new Logger(KjplService.name);
  private fetchInProgress = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  isEnabled(): boolean {
    return this.config.get<string>('KJPL_RATES_ENABLED') === 'true';
  }

  pollIntervalMinutes(): number {
    const n = Number(this.config.get<string>('KJPL_POLL_INTERVAL_MINUTES') ?? 15);
    return Number.isFinite(n) && n >= 5 && n <= 120 ? n : 15;
  }

  async readCache(): Promise<CachedPayload | null> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: CACHE_KEY } });
    if (!row?.value) return null;
    try {
      return JSON.parse(row.value) as CachedPayload;
    } catch {
      return null;
    }
  }

  private async persistCache(payload: CachedPayload) {
    const json = JSON.stringify(payload);
    await this.prisma.appSetting.upsert({
      where: { key: CACHE_KEY },
      create: { key: CACHE_KEY, value: json },
      update: { value: json },
    });
  }

  async refreshRates(): Promise<{ ok: boolean; message: string }> {
    if (!this.isEnabled()) {
      return { ok: false, message: 'KJPL_RATES_ENABLED is not true' };
    }
    if (this.fetchInProgress) {
      return { ok: false, message: 'KJPL fetch already in progress' };
    }
    this.fetchInProgress = true;
    try {
      const html = await fetchKjplHomeHtml();
      const parsed = parseKjplMjdtaRates(html);
      if (!parsed) {
        return { ok: false, message: 'Could not parse MJDTA rates from kjpl.in HTML' };
      }
      const payload: CachedPayload = {
        rates: parsed,
        fetchedAt: new Date().toISOString(),
        sourceUrl: this.config.get<string>('KJPL_RATES_URL')?.trim() ?? 'https://kjpl.in/',
      };
      await this.persistCache(payload);
      this.logger.log(`KJPL rates cached: gold=${parsed.goldWithoutGstInr} silver=${parsed.silverWithoutGstInr}`);
      return { ok: true, message: 'KJPL rates updated' };
    } catch (e) {
      const msg = e instanceof KjplFetchError ? e.message : e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn(`KJPL fetch failed: ${msg}`);
      return { ok: false, message: msg };
    } finally {
      this.fetchInProgress = false;
    }
  }

  async getPublicMarketRates(): Promise<PublicMarketRatesDto> {
    const cache = await this.readCache();
    const fetchedAt = cache?.fetchedAt ?? null;
    const ageMs = fetchedAt ? Date.now() - new Date(fetchedAt).getTime() : Infinity;
    const isStale = !fetchedAt || ageMs > STALE_AFTER_MS;
    const r = cache?.rates;

    return {
      provider: 'kjpl.in',
      currency: 'INR',
      unit: 'MJDTA reference rate (as displayed on kjpl.in — confirm unit with KJPL / showroom)',
      disclaimer:
        'Reference MJDTA bullion rates from kjpl.in for customer information only. Showroom selling prices may differ after purity, making charges, GST, and shop policy. Not investment advice.',
      fetchedAt,
      sourceTimestampGold: r?.sourceUpdatedAtText ?? null,
      sourceTimestampSilver: r?.sourceUpdatedAtText ?? null,
      isStale,
      staleMessage: isStale
        ? 'Rates may be outdated. We show the last successful fetch until the next update.'
        : null,
      schedulerEnabled: this.isEnabled(),
      configured: this.isEnabled() && Boolean(cache),
      gold: r
        ? {
            price24kPerGram: null,
            price22kPerGram: null,
            price18kPerGram: null,
            purityNote:
              'KJPL MJDTA gold rate (without GST) is shown in the KJPL section below — not a per-gram 24K shop price.',
          }
        : null,
      silver: r ? { pricePerGram: null } : null,
      usage: { yearMonth: 'n/a', requestCount: 0, monthlyLimit: 0 },
      kjpl: r
        ? {
            goldWithoutGstInr: r.goldWithoutGstInr,
            goldWithGstInr: r.goldWithGstInr,
            silverWithoutGstInr: r.silverWithoutGstInr,
            silverWithGstInr: r.silverWithGstInr,
            sourceUpdatedAtText: r.sourceUpdatedAtText,
          }
        : null,
    };
  }
}
