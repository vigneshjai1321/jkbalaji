import { karatFrom24k, inrPerGramFromTroyOz } from './goldapi-purity.js';
import type { GoldApiPriceResponse } from './goldapi.types.js';

export type ParsedMetalQuote = {
  pricePerGram: number;
  price22kPerGram: number | null;
  price18kPerGram: number | null;
  rawPriceTroyOz: number | null;
  sourceTimestamp: Date | null;
  usedApiKaratFields: boolean;
};

export function parseGoldQuote(data: GoldApiPriceResponse): ParsedMetalQuote {
  let rate24: number | null = null;
  if (typeof data.price_gram_24k === 'number' && data.price_gram_24k > 0) {
    rate24 = data.price_gram_24k;
  } else if (typeof data.price === 'number' && data.price > 0) {
    rate24 = inrPerGramFromTroyOz(data.price);
  }
  if (rate24 == null || !Number.isFinite(rate24)) {
    throw new Error('GoldAPI gold response missing usable 24K gram or troy oz price');
  }

  let rate22: number | null = null;
  let rate18: number | null = null;
  let usedApiKaratFields = false;
  if (typeof data.price_gram_22k === 'number' && data.price_gram_22k > 0) {
    rate22 = data.price_gram_22k;
    usedApiKaratFields = true;
  } else {
    rate22 = karatFrom24k(rate24, 22);
  }
  if (typeof data.price_gram_18k === 'number' && data.price_gram_18k > 0) {
    rate18 = data.price_gram_18k;
    usedApiKaratFields = true;
  } else {
    rate18 = karatFrom24k(rate24, 18);
  }

  return {
    pricePerGram: rate24,
    price22kPerGram: rate22,
    price18kPerGram: rate18,
    rawPriceTroyOz: typeof data.price === 'number' ? data.price : null,
    sourceTimestamp: apiTimestampToDate(data.timestamp),
    usedApiKaratFields,
  };
}

export function parseSilverQuote(data: GoldApiPriceResponse): ParsedMetalQuote {
  let perGram: number | null = null;
  if (typeof data.price_gram === 'number' && data.price_gram > 0) {
    perGram = data.price_gram;
  } else if (typeof data.price_gram_24k === 'number' && data.price_gram_24k > 0) {
    perGram = data.price_gram_24k;
  } else if (typeof data.price === 'number' && data.price > 0) {
    perGram = inrPerGramFromTroyOz(data.price);
  }
  if (perGram == null || !Number.isFinite(perGram)) {
    throw new Error('GoldAPI silver response missing usable gram or troy oz price');
  }
  return {
    pricePerGram: perGram,
    price22kPerGram: null,
    price18kPerGram: null,
    rawPriceTroyOz: typeof data.price === 'number' ? data.price : null,
    sourceTimestamp: apiTimestampToDate(data.timestamp),
    usedApiKaratFields: false,
  };
}

function apiTimestampToDate(ts?: number): Date | null {
  if (typeof ts !== 'number' || ts <= 0) return null;
  const ms = ts > 1e12 ? ts : ts * 1000;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}
