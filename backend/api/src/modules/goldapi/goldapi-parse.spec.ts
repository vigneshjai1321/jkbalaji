import { describe, expect, it } from 'vitest';
import { parseGoldQuote, parseSilverQuote } from './goldapi-parse.js';

describe('parseGoldQuote', () => {
  it('uses API karat fields when present', () => {
    const q = parseGoldQuote({
      timestamp: 1791748380,
      price: 406031,
      price_gram_24k: 13054.2,
      price_gram_22k: 11966.35,
      price_gram_18k: 9790.65,
    });
    expect(q.pricePerGram).toBe(13054.2);
    expect(q.price22kPerGram).toBe(11966.35);
    expect(q.price18kPerGram).toBe(9790.65);
    expect(q.usedApiKaratFields).toBe(true);
  });

  it('derives karats from troy oz when gram fields missing', () => {
    const q = parseGoldQuote({ timestamp: 1_700_000_000, price: 31034.6 });
    expect(q.pricePerGram).toBeCloseTo(997.77, 1);
    expect(q.price22kPerGram).toBeCloseTo(q.pricePerGram * (22 / 24), 2);
    expect(q.usedApiKaratFields).toBe(false);
  });
});

describe('parseSilverQuote', () => {
  it('accepts price_gram', () => {
    const q = parseSilverQuote({ price_gram: 85.5, price: 2659 });
    expect(q.pricePerGram).toBe(85.5);
  });
});
