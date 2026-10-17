import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service.js';
import type { PublicMarketRatesDto } from '../goldapi/goldapi.types.js';
import { fetchKjplHomeHtml, KjplFetchError } from './kjpl.client.js';
import { parseKjplMjdtaRates, type KjplParsedRates } from './kjpl-parse.js';
import { KjplAlertsService } from './kjpl-alerts.service.js';
import {
  KJPL_BOARD_KEY,
  KJPL_CACHE_KEY,
  KJPL_SHOP_SILVER_KEY,
  sanitizeKjplError,
  validateKjplParsed,
} from './kjpl-status.js';
import { mapKjplToShopRates, shopRatesUnchanged, verifyKjplShopUnits } from './kjpl-shop-rates.js';
import {
  boardDisplayHealth,
  fetchKjplBoardSnapshot,
  type KjplBoardCache,
} from './kjpl-board.js';

/** Align stale hint with default poll interval (15 min) plus buffer. */
export const KJPL_STALE_AFTER_MS = 20 * 60 * 1000;

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
    private readonly alerts: KjplAlertsService,
  ) {}

  isEnabled(): boolean {
    return this.config.get<string>('KJPL_RATES_ENABLED') === 'true';
  }

  pollIntervalMinutes(): number {
    const n = Number(this.config.get<string>('KJPL_POLL_INTERVAL_MINUTES') ?? 15);
    return Number.isFinite(n) && n >= 5 && n <= 120 ? n : 15;
  }

  staleAfterMs(): number {
    return KJPL_STALE_AFTER_MS;
  }

  async readCache(): Promise<CachedPayload | null> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: KJPL_CACHE_KEY } });
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
      where: { key: KJPL_CACHE_KEY },
      create: { key: KJPL_CACHE_KEY, value: json },
      update: { value: json },
    });
  }

  async getAdminOperationalStatus() {
    const cache = await this.readCache();
    const status = await this.alerts.readStatus();
    const fetchedAt = status.lastSuccessAt ?? null;
    const ageMs = fetchedAt ? Date.now() - new Date(fetchedAt).getTime() : Infinity;
    const isStale = !fetchedAt || ageMs > KJPL_STALE_AFTER_MS;
    let health: 'fresh' | 'stale' | 'error' | 'unavailable' | 'updating' = 'unavailable';
    if (this.fetchInProgress) health = 'updating';
    else if (status.lastErrorCategory) health = 'error';
    else if (isStale) health = 'stale';
    else health = 'fresh';

    return {
      enabled: this.isEnabled(),
      pollIntervalMinutes: this.pollIntervalMinutes(),
      staleAfterMinutes: Math.round(KJPL_STALE_AFTER_MS / 60_000),
      health,
      isStale,
      lastAttemptAt: status.lastAttemptAt,
      lastSuccessAt: status.lastSuccessAt,
      lastErrorCategory: status.lastErrorCategory,
      lastErrorMessage: status.lastErrorMessage,
      nextScheduledAt: status.nextScheduledAt,
      activeFailureNotificationId: status.activeFailureNotificationId,
      cache: cache
        ? {
            fetchedAt: cache.fetchedAt,
            sourceUrl: cache.sourceUrl,
            rates: cache.rates,
          }
        : null,
      shop: await this.readShopRates(),
      board: await this.readBoardStatus(),
      updating: this.fetchInProgress,
    };
  }

  private async readBoard(): Promise<KjplBoardCache | null> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: KJPL_BOARD_KEY } });
    if (!row?.value) return null;
    try {
      const parsed = JSON.parse(row.value) as KjplBoardCache;
      if (parsed.gold?.description !== 'GOLD') parsed.gold = null;
      if (parsed.silver?.description !== 'SILVER') parsed.silver = null;
      return parsed;
    } catch {
      return null;
    }
  }

  private async persistBoard(payload: KjplBoardCache) {
    const json = JSON.stringify(payload);
    await this.prisma.appSetting.upsert({
      where: { key: KJPL_BOARD_KEY },
      create: { key: KJPL_BOARD_KEY, value: json },
      update: { value: json },
    });
  }

  private async readBoardStatus() {
    const cache = await this.readBoard();
    const health = boardDisplayHealth(cache, Date.now(), KJPL_STALE_AFTER_MS, this.fetchInProgress);
    return {
      health,
      isLive: health === 'fresh',
      fetchedAt: cache?.fetchedAt ?? null,
      lastAttemptAt: cache?.lastAttemptAt ?? null,
      lastError: health === 'fresh' ? null : cache?.lastError ?? null,
      unitLabel: 'INR · KJPL board quote',
      rows: [
        cache?.gold ?? null,
        cache?.silver ?? null,
      ],
    };
  }

  /** Market-board snapshot. Does not write shop billing rates. */
  private async refreshMarketBoard(html: string | null): Promise<{ ok: boolean; message: string }> {
    const prior = await this.readBoard();
    const now = new Date().toISOString();
    const keep = {
      gold: prior?.gold ?? null,
      silver: prior?.silver ?? null,
      fetchedAt: prior?.fetchedAt ?? null,
    };
    if (!html) {
      const message = 'KJPL page could not be loaded. Last market board was kept.';
      await this.persistBoard({ ...keep, lastAttemptAt: now, lastError: message });
      return { ok: false, message };
    }
    try {
      const snap = await fetchKjplBoardSnapshot({ html });
      await this.persistBoard({
        gold: snap.gold,
        silver: snap.silver,
        fetchedAt: snap.fetchedAt,
        lastAttemptAt: now,
        lastError: null,
      });
      this.logger.log(
        `KJPL board GOLD buy=${snap.gold.buying} sell=${snap.gold.selling} high=${snap.gold.high} low=${snap.gold.low}; SILVER buy=${snap.silver.buying} sell=${snap.silver.selling} high=${snap.silver.high} low=${snap.silver.low}`,
      );
      return { ok: true, message: 'Market board updated' };
    } catch (e) {
      const raw = e instanceof KjplFetchError ? e.message : e instanceof Error ? e.message : 'Market board update failed';
      const message = sanitizeKjplError(raw);
      await this.persistBoard({ ...keep, lastAttemptAt: now, lastError: message });
      this.logger.warn(`KJPL market board failed: ${message}`);
      return { ok: false, message };
    }
  }

  private async readShopRates() {
    const [latest, silverRow] = await Promise.all([
      this.prisma.goldRate.findFirst({ orderBy: { createdAt: 'desc' } }),
      this.prisma.appSetting.findUnique({ where: { key: KJPL_SHOP_SILVER_KEY } }),
    ]);
    let silverPerGram: number | null = null;
    let silverUpdatedAt: string | null = null;
    if (silverRow?.value) {
      try {
        const parsed = JSON.parse(silverRow.value) as { perGram?: number; updatedAt?: string };
        if (typeof parsed.perGram === 'number') silverPerGram = parsed.perGram;
        silverUpdatedAt = parsed.updatedAt ?? null;
      } catch {
        silverPerGram = null;
      }
    }
    if (!latest) return null;
    const rate22k = Number(latest.rate22k);
    const mapped = mapKjplToShopRates({
      goldWithoutGstInr: rate22k,
      silverWithoutGstInr: silverPerGram ?? 0,
      goldWithGstInr: null,
      silverWithGstInr: null,
      sourceUpdatedAtText: null,
    });
    return {
      rate22kPerGram: rate22k,
      rate24kPerGram: Number(latest.rate24k),
      silverPerGram,
      sovereign22k8g: mapped.sovereign22k8g,
      updatedAt: latest.createdAt.toISOString(),
      silverUpdatedAt,
      rate24kDerived: true,
    };
  }

  /** Writes 22K/24K shop rates and silver only when verified KJPL values changed. */
  private async syncShopRates(parsed: KjplParsedRates): Promise<{ ok: boolean; message: string; wrote: boolean }> {
    const check = verifyKjplShopUnits(parsed);
    if (!check.ok) return { ok: false, message: check.reason, wrote: false };
    const next = mapKjplToShopRates(parsed);
    const [latest, silverRow] = await Promise.all([
      this.prisma.goldRate.findFirst({ orderBy: { createdAt: 'desc' } }),
      this.prisma.appSetting.findUnique({ where: { key: KJPL_SHOP_SILVER_KEY } }),
    ]);
    let previousSilver: number | null = null;
    if (silverRow?.value) {
      try {
        previousSilver = Number((JSON.parse(silverRow.value) as { perGram?: number }).perGram);
        if (!Number.isFinite(previousSilver)) previousSilver = null;
      } catch {
        previousSilver = null;
      }
    }
    const unchanged =
      latest != null &&
      shopRatesUnchanged(
        { rate22k: Number(latest.rate22k), rate24k: Number(latest.rate24k), silverPerGram: previousSilver },
        next,
      );
    if (unchanged) {
      return { ok: true, message: 'Shop rates already match KJPL', wrote: false };
    }
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.goldRate.create({
        data: { rate22k: next.rate22kPerGram, rate24k: next.rate24kPerGram, effectiveDate: now },
      });
      await tx.appSetting.upsert({
        where: { key: KJPL_SHOP_SILVER_KEY },
        create: { key: KJPL_SHOP_SILVER_KEY, value: JSON.stringify({ perGram: next.silverPerGram, updatedAt: now.toISOString() }) },
        update: { value: JSON.stringify({ perGram: next.silverPerGram, updatedAt: now.toISOString() }) },
      });
    });
    const saved = await this.prisma.goldRate.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!saved || Math.abs(Number(saved.rate22k) - next.rate22kPerGram) > 0.02) {
      return { ok: false, message: 'Shop rates were not saved. Previous rates are unchanged.', wrote: false };
    }
    return { ok: true, message: 'Shop rates updated from KJPL', wrote: true };
  }

  async refreshRates(): Promise<{ ok: boolean; message: string; boardOk: boolean; boardMessage: string }> {
    if (!this.isEnabled()) {
      return { ok: false, message: 'KJPL_RATES_ENABLED is not true', boardOk: false, boardMessage: 'KJPL is disabled' };
    }
    if (this.fetchInProgress) {
      return { ok: false, message: 'KJPL fetch already in progress', boardOk: false, boardMessage: 'KJPL fetch already in progress' };
    }
    this.fetchInProgress = true;
    await this.alerts.recordAttempt();
    const priorCache = await this.readCache();
    const priorStatus = await this.alerts.readStatus();
    let html: string | null = null;
    const result = { ok: false, message: 'KJPL fetch failed', boardOk: false, boardMessage: '' };

    try {
      html = await fetchKjplHomeHtml();
      const parsed = parseKjplMjdtaRates(html);
      if (!parsed) {
        const msg = 'Invalid or incomplete KJPL HTML — rates not updated';
        await this.alerts.recordFailure('PARSE', msg, priorStatus.lastSuccessAt ?? priorCache?.fetchedAt ?? null);
        result.message = msg;
      } else if (!validateKjplParsed(parsed)) {
        const msg = 'KJPL returned implausible rate values — rates not updated';
        await this.alerts.recordFailure('VALIDATION', msg, priorStatus.lastSuccessAt ?? priorCache?.fetchedAt ?? null);
        result.message = msg;
      } else {
        const unitCheck = verifyKjplShopUnits(parsed);
        if (!unitCheck.ok) {
          await this.alerts.recordFailure('VALIDATION', unitCheck.reason, priorStatus.lastSuccessAt ?? priorCache?.fetchedAt ?? null);
          result.message = unitCheck.reason;
        } else {
          const payload: CachedPayload = {
            rates: parsed,
            fetchedAt: new Date().toISOString(),
            sourceUrl: this.config.get<string>('KJPL_RATES_URL')?.trim() ?? 'https://kjpl.in/',
          };
          await this.persistCache(payload);
          const synced = await this.syncShopRates(parsed);
          if (!synced.ok) {
            await this.alerts.recordFailure('SYNC', synced.message, priorStatus.lastSuccessAt ?? priorCache?.fetchedAt ?? null);
            result.message = synced.message;
          } else {
            const verified = await this.readShopRates();
            const expected = mapKjplToShopRates(parsed);
            if (!verified || Math.abs(verified.rate22kPerGram - expected.rate22kPerGram) > 0.02) {
              const msg = 'Shop rate sync could not be verified. Previous billing rates were kept.';
              await this.alerts.recordFailure('SYNC', msg, priorStatus.lastSuccessAt ?? priorCache?.fetchedAt ?? null);
              result.message = msg;
            } else {
              await this.alerts.recordSuccess();
              this.logger.log(
                `KJPL shop rates ${synced.wrote ? 'saved' : 'unchanged'}: 22k=${expected.rate22kPerGram} 24k=${expected.rate24kPerGram} silver=${expected.silverPerGram} sovereign=${expected.sovereign22k8g}`,
              );
              result.ok = true;
              result.message = synced.wrote ? 'Shop rates updated from KJPL' : 'Shop rates already match KJPL';
            }
          }
        }
      }
    } catch (e) {
      const raw = e instanceof KjplFetchError ? e.message : e instanceof Error ? e.message : 'Unknown error';
      const msg = sanitizeKjplError(raw);
      const category = e instanceof KjplFetchError ? 'FETCH' : 'ERROR';
      this.logger.warn(`KJPL fetch failed: ${msg}`);
      await this.alerts.recordFailure(category, msg, priorStatus.lastSuccessAt ?? priorCache?.fetchedAt ?? null);
      result.message = msg;
    } finally {
      try {
        const board = await this.refreshMarketBoard(html);
        result.boardOk = board.ok;
        result.boardMessage = board.message;
      } catch (e) {
        const raw = e instanceof Error ? e.message : 'Market board update failed';
        result.boardOk = false;
        result.boardMessage = sanitizeKjplError(raw);
      }
      this.fetchInProgress = false;
    }
    return result;
  }

  async getPublicMarketRates(): Promise<PublicMarketRatesDto> {
    const cache = await this.readCache();
    const status = await this.alerts.readStatus();
    const successAt = status.lastSuccessAt ?? null;
    const ageMs = successAt ? Date.now() - new Date(successAt).getTime() : Infinity;
    const isStale = !successAt || ageMs > KJPL_STALE_AFTER_MS;
    const shop = await this.readShopRates();
    const fetchFailed = Boolean(status.lastErrorCategory && status.lastAttemptAt && (!successAt || status.lastAttemptAt > successAt));
    const sourceText = cache?.rates?.sourceUpdatedAtText ?? null;

    return {
      provider: 'kjpl.in',
      currency: 'INR',
      unit: 'INR per gram',
      disclaimer: '22K and silver are KJPL MJDTA rates without GST. 24K is 22K × 24/22. One sovereign is 22K × 8 g. Making charges are not included.',
      fetchedAt: successAt,
      sourceTimestampGold: sourceText,
      sourceTimestampSilver: sourceText,
      isStale,
      staleMessage: isStale
        ? fetchFailed
          ? 'Last refresh failed. Showing the last saved shop rates.'
          : 'Rates may be outdated. Showing the last saved shop rates.'
        : null,
      schedulerEnabled: this.isEnabled(),
      configured: this.isEnabled() && Boolean(shop),
      gold: shop
        ? {
            price24kPerGram: shop.rate24kPerGram,
            price22kPerGram: shop.rate22kPerGram,
            price18kPerGram: null,
            purityNote: '24K is derived from the 22K per-gram rate × 24/22.',
          }
        : null,
      silver: shop?.silverPerGram != null ? { pricePerGram: shop.silverPerGram } : null,
      usage: { yearMonth: 'n/a', requestCount: 0, monthlyLimit: 0 },
      kjpl: cache?.rates
        ? {
            goldWithoutGstInr: cache.rates.goldWithoutGstInr,
            goldWithGstInr: cache.rates.goldWithGstInr,
            silverWithoutGstInr: cache.rates.silverWithoutGstInr,
            silverWithGstInr: cache.rates.silverWithGstInr,
            sourceUpdatedAtText: cache.rates.sourceUpdatedAtText,
          }
        : null,
    };
  }
}
