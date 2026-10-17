import type { KjplParsedRates } from './kjpl-parse.js';

/** Tamil Nadu board convention: 1 sovereign = 8 grams of 22K. Excludes making charges and GST. */
export const GRAMS_PER_SOVEREIGN = 8;

/**
 * Existing purity convention (see goldapi-purity karatFrom24k): 22K = 24K × 22/24.
 * KJPL MJDTA "GOLD" without GST is the 22K per-gram rate, so 24K = 22K × 24/22.
 */
export const KARAT_24_FROM_22 = 24 / 22;

export type ShopRateSnapshot = {
  rate22kPerGram: number;
  rate24kPerGram: number;
  silverPerGram: number;
  sovereign22k8g: number;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * MJDTA headline gold on kjpl.in is rupees per gram (22K board rate), not per 10 g or per kg.
 * Confirmed by magnitude and by the with-GST column being ~3% jewellery GST on the same figure.
 * Silver headline is rupees per gram.
 */
export function verifyKjplShopUnits(rates: KjplParsedRates): { ok: true } | { ok: false; reason: string } {
  const gold = rates.goldWithoutGstInr;
  const silver = rates.silverWithoutGstInr;
  if (!Number.isFinite(gold) || gold < 8_000 || gold > 30_000) {
    return { ok: false, reason: 'KJPL gold value is not a verified per-gram 22K rate. Shop rates were not changed.' };
  }
  if (!Number.isFinite(silver) || silver < 40 || silver > 2_000) {
    return { ok: false, reason: 'KJPL silver value is not a verified per-gram rate. Shop rates were not changed.' };
  }
  if (rates.goldWithGstInr != null) {
    const ratio = rates.goldWithGstInr / gold;
    if (!(ratio >= 1.02 && ratio <= 1.05)) {
      return {
        ok: false,
        reason: 'KJPL gold with GST does not match 3% on the without-GST figure. Shop rates were not changed.',
      };
    }
  }
  if (rates.silverWithGstInr != null) {
    const ratio = rates.silverWithGstInr / silver;
    if (!(ratio >= 1.02 && ratio <= 1.05)) {
      return {
        ok: false,
        reason: 'KJPL silver with GST does not match 3% on the without-GST figure. Shop rates were not changed.',
      };
    }
  }
  return { ok: true };
}

export function mapKjplToShopRates(rates: KjplParsedRates): ShopRateSnapshot {
  const rate22kPerGram = round2(rates.goldWithoutGstInr);
  const rate24kPerGram = round2(rate22kPerGram * KARAT_24_FROM_22);
  const silverPerGram = round2(rates.silverWithoutGstInr);
  const sovereign22k8g = round2(rate22kPerGram * GRAMS_PER_SOVEREIGN);
  return { rate22kPerGram, rate24kPerGram, silverPerGram, sovereign22k8g };
}

export function shopRatesUnchanged(
  previous: { rate22k: number; rate24k: number; silverPerGram: number | null },
  next: ShopRateSnapshot,
): boolean {
  const close = (a: number, b: number) => Math.abs(a - b) < 0.02;
  if (!close(previous.rate22k, next.rate22kPerGram)) return false;
  if (!close(previous.rate24k, next.rate24kPerGram)) return false;
  if (previous.silverPerGram == null || !close(previous.silverPerGram, next.silverPerGram)) return false;
  return true;
}
