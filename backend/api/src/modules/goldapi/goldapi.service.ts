import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetalSymbol } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { fetchMetalInrPrice, GoldApiClientError } from './goldapi.client.js';
import { istDateString, istYearMonth } from './goldapi-ist.js';
import { parseGoldQuote, parseSilverQuote } from './goldapi-parse.js';
import { PURITY_CALC_NOTE } from './goldapi-purity.js';
import type { PublicMarketRatesDto } from './goldapi.types.js';

const MONTHLY_LIMIT = 100;
const STALE_AFTER_MS = 36 * 60 * 60 * 1000; // ~1.5 days without fresh fetch

@Injectable()
export class GoldApiService {
  private readonly logger = new Logger(GoldApiService.name);
  private subscriptionChecked = false;
  private goldEndpointOk = false;
  private silverEndpointOk = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('GOLDAPI_ACCESS_TOKEN')?.trim());
  }

  isSchedulerEnabled(): boolean {
    if (!this.isConfigured()) return false;
    if (this.config.get<string>('GOLDAPI_SCHEDULER_ENABLED') === 'false') return false;
    return this.goldEndpointOk && this.silverEndpointOk;
  }

  async getUsage(yearMonth = istYearMonth()) {
    const row = await this.prisma.goldApiUsageMonth.findUnique({ where: { yearMonth } });
    return { yearMonth, requestCount: row?.requestCount ?? 0, monthlyLimit: MONTHLY_LIMIT };
  }

  async incrementUsage(count: number) {
    const yearMonth = istYearMonth();
    await this.prisma.goldApiUsageMonth.upsert({
      where: { yearMonth },
      create: { yearMonth, requestCount: count },
      update: { requestCount: { increment: count } },
    });
  }

  /** One-time subscription probe (2 API calls). Does not run on every page view. */
  async verifySubscriptionEndpoints(): Promise<{ gold: boolean; silver: boolean; message: string }> {
    const token = this.config.get<string>('GOLDAPI_ACCESS_TOKEN')?.trim();
    if (!token) {
      return { gold: false, silver: false, message: 'GOLDAPI_ACCESS_TOKEN is not configured' };
    }
    let gold = false;
    let silver = false;
    try {
      await fetchMetalInrPrice('XAU', token);
      gold = true;
      await this.incrementUsage(1);
    } catch (e) {
      this.logger.warn(`GoldAPI XAU verification failed: ${safeErr(e)}`);
    }
    try {
      await fetchMetalInrPrice('XAG', token);
      silver = true;
      await this.incrementUsage(1);
    } catch (e) {
      this.logger.warn(`GoldAPI XAG verification failed: ${safeErr(e)}`);
    }
    this.subscriptionChecked = true;
    this.goldEndpointOk = gold;
    this.silverEndpointOk = silver;
    await this.prisma.appSetting.upsert({
      where: { key: 'goldapi_endpoints_verified' },
      create: {
        key: 'goldapi_endpoints_verified',
        value: JSON.stringify({ gold, silver, at: new Date().toISOString() }),
      },
      update: { value: JSON.stringify({ gold, silver, at: new Date().toISOString() }) },
    });
    const message =
      gold && silver
        ? 'Gold (XAU/INR) and silver (XAG/INR) endpoints are accessible on your plan.'
        : 'One or both endpoints failed — automatic daily updates stay disabled until both succeed.';
    return { gold, silver, message };
  }

  async loadVerificationFromDb() {
    const row = await this.prisma.appSetting.findUnique({ where: { key: 'goldapi_endpoints_verified' } });
    if (!row) return;
    try {
      const parsed = JSON.parse(row.value) as { gold?: boolean; silver?: boolean };
      this.goldEndpointOk = parsed.gold === true;
      this.silverEndpointOk = parsed.silver === true;
      this.subscriptionChecked = true;
    } catch {
      /* ignore */
    }
  }

  async runDailyFetch(trigger: 'cron' | 'manual'): Promise<{ ok: boolean; message: string }> {
    const token = this.config.get<string>('GOLDAPI_ACCESS_TOKEN')?.trim();
    if (!token) {
      return { ok: false, message: 'GOLDAPI_ACCESS_TOKEN not configured' };
    }

    if (!this.subscriptionChecked) {
      await this.loadVerificationFromDb();
    }
    if (!this.goldEndpointOk || !this.silverEndpointOk) {
      const verify = await this.verifySubscriptionEndpoints();
      if (!verify.gold || !verify.silver) {
        return { ok: false, message: verify.message };
      }
    }

    const usage = await this.getUsage();
    if (usage.requestCount + 2 > MONTHLY_LIMIT) {
      const msg = `GoldAPI monthly limit (${MONTHLY_LIMIT}) would be exceeded; skipping fetch.`;
      this.logger.warn(msg);
      return { ok: false, message: msg };
    }

    const fetchDate = istDateString();
    const fetchDateObj = new Date(`${fetchDate}T00:00:00.000Z`);

    let daily = await this.prisma.goldApiDailyFetch.findUnique({ where: { fetchDate: fetchDateObj } });
    if (daily?.status === 'success' && trigger === 'cron') {
      this.logger.log(`GoldAPI daily fetch already completed for ${fetchDate}`);
      return { ok: true, message: 'Already fetched today' };
    }

    const batchId = crypto.randomUUID();
    if (!daily) {
      try {
        daily = await this.prisma.goldApiDailyFetch.create({
          data: { fetchDate: fetchDateObj, status: 'in_progress', fetchBatchId: batchId },
        });
      } catch {
        this.logger.log(`GoldAPI fetch lock: another instance owns ${fetchDate}`);
        return { ok: false, message: 'Fetch already in progress or completed today' };
      }
    } else if (daily.status === 'in_progress') {
      return { ok: false, message: 'Fetch already in progress' };
    } else {
      await this.prisma.goldApiDailyFetch.update({
        where: { id: daily.id },
        data: { status: 'in_progress', fetchBatchId: batchId, errorMessage: null },
      });
    }

    let requests = 0;
    try {
      const goldRaw = await fetchMetalInrPrice('XAU', token);
      requests += 1;
      const gold = parseGoldQuote(goldRaw);
      await this.prisma.metalMarketRate.create({
        data: {
          metal: MetalSymbol.XAU,
          currency: 'INR',
          unit: 'gram',
          pricePerGram: gold.pricePerGram,
          price22kPerGram: gold.price22kPerGram,
          price18kPerGram: gold.price18kPerGram,
          provider: 'goldapi.io',
          sourceTimestamp: gold.sourceTimestamp,
          fetchedAt: new Date(),
          rawPriceTroyOz: gold.rawPriceTroyOz,
          fetchBatchId: batchId,
        },
      });

      const silverRaw = await fetchMetalInrPrice('XAG', token);
      requests += 1;
      const silver = parseSilverQuote(silverRaw);
      await this.prisma.metalMarketRate.create({
        data: {
          metal: MetalSymbol.XAG,
          currency: 'INR',
          unit: 'gram',
          pricePerGram: silver.pricePerGram,
          provider: 'goldapi.io',
          sourceTimestamp: silver.sourceTimestamp,
          fetchedAt: new Date(),
          rawPriceTroyOz: silver.rawPriceTroyOz,
          fetchBatchId: batchId,
        },
      });

      await this.incrementUsage(requests);
      await this.prisma.goldApiDailyFetch.update({
        where: { fetchDate: fetchDateObj },
        data: { status: 'success', fetchBatchId: batchId, errorMessage: null },
      });
      this.logger.log(`GoldAPI daily fetch succeeded (${trigger}, batch ${batchId})`);
      return { ok: true, message: 'Market rates updated' };
    } catch (e) {
      const msg = safeErr(e);
      this.logger.error(`GoldAPI daily fetch failed (${trigger}): ${msg}`);
      if (requests > 0) await this.incrementUsage(requests);
      await this.prisma.goldApiDailyFetch.update({
        where: { fetchDate: fetchDateObj },
        data: { status: 'failed', errorMessage: msg.slice(0, 500) },
      });
      return { ok: false, message: msg };
    }
  }

  async getLatestMetal(metal: MetalSymbol) {
    return this.prisma.metalMarketRate.findFirst({
      where: { metal },
      orderBy: { fetchedAt: 'desc' },
    });
  }

  async getPublicMarketRates(): Promise<PublicMarketRatesDto> {
    if (!this.subscriptionChecked) await this.loadVerificationFromDb();
    const [gold, silver, usage] = await Promise.all([
      this.getLatestMetal(MetalSymbol.XAU),
      this.getLatestMetal(MetalSymbol.XAG),
      this.getUsage(),
    ]);

    const fetchedAt = gold?.fetchedAt ?? silver?.fetchedAt ?? null;
    const ageMs = fetchedAt ? Date.now() - fetchedAt.getTime() : Infinity;
    const isStale = !fetchedAt || ageMs > STALE_AFTER_MS;

    return {
      provider: 'goldapi.io',
      currency: 'INR',
      unit: 'INR per gram',
      disclaimer:
        'Market benchmark from GoldAPI.io. Showroom selling prices may differ after making charges, wastage, GST, and shop policy.',
      fetchedAt: fetchedAt?.toISOString() ?? null,
      sourceTimestampGold: gold?.sourceTimestamp?.toISOString() ?? null,
      sourceTimestampSilver: silver?.sourceTimestamp?.toISOString() ?? null,
      isStale,
      staleMessage: isStale
        ? 'Rates may be outdated. We show the last successful fetch until the next daily update.'
        : null,
      schedulerEnabled: this.isSchedulerEnabled(),
      configured: this.isConfigured(),
      gold: gold
        ? {
            price24kPerGram: Number(gold.pricePerGram),
            price22kPerGram: gold.price22kPerGram != null ? Number(gold.price22kPerGram) : null,
            price18kPerGram: gold.price18kPerGram != null ? Number(gold.price18kPerGram) : null,
            purityNote: PURITY_CALC_NOTE,
          }
        : null,
      silver: silver ? { pricePerGram: Number(silver.pricePerGram) } : null,
      usage,
    };
  }
}

function safeErr(e: unknown): string {
  if (e instanceof GoldApiClientError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}
