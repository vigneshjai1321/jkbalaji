import { describe, expect, it } from 'vitest';
import { mapKjplToShopRates, shopRatesUnchanged, verifyKjplShopUnits } from './kjpl-shop-rates.js';

const liveLike = {
  goldWithoutGstInr: 13515,
  silverWithoutGstInr: 240,
  goldWithGstInr: 13920.45,
  silverWithGstInr: 247.2,
  sourceUpdatedAtText: '16-10-2026 09:26:39 am',
};

describe('KJPL shop rate mapping', () => {
  it('accepts the verified per-gram MJDTA pair', () => {
    expect(verifyKjplShopUnits(liveLike).ok).toBe(true);
  });

  it('rejects gold that is not a per-gram 22K figure', () => {
    const result = verifyKjplShopUnits({ ...liveLike, goldWithoutGstInr: 135150 });
    expect(result.ok).toBe(false);
  });

  it('rejects a with-GST gold figure that is not ~3% above the base', () => {
    const result = verifyKjplShopUnits({ ...liveLike, goldWithGstInr: 20000 });
    expect(result.ok).toBe(false);
  });

  it('maps 22K, 24K (24/22), silver, and sovereign (× 8)', () => {
    const mapped = mapKjplToShopRates(liveLike);
    expect(mapped.rate22kPerGram).toBe(13515);
    expect(mapped.rate24kPerGram).toBe(14743.64);
    expect(mapped.silverPerGram).toBe(240);
    expect(mapped.sovereign22k8g).toBe(108120);
  });

  it('detects unchanged shop rates', () => {
    const next = mapKjplToShopRates(liveLike);
    expect(
      shopRatesUnchanged(
        { rate22k: 13515, rate24k: 14743.64, silverPerGram: 240 },
        next,
      ),
    ).toBe(true);
    expect(shopRatesUnchanged({ rate22k: 13000, rate24k: 14743.64, silverPerGram: 240 }, next)).toBe(false);
  });
});
