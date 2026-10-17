/** Tamil Nadu convention: 1 sovereign = 8 grams (bullion reference only; excludes making/GST). */
export const GRAMS_PER_SOVEREIGN = 8;

export type ShopGoldRate = {
  purity: '22K' | '24K';
  ratePerGram: number;
  effectiveDate?: string | null;
};

export function sovereignGoldPriceInr(rate: ShopGoldRate | null): number | null {
  if (!rate || !Number.isFinite(rate.ratePerGram) || rate.ratePerGram <= 0) return null;
  return Math.round(rate.ratePerGram * GRAMS_PER_SOVEREIGN * 100) / 100;
}

export function formatSovereignLabel(purity: '22K' | '24K' = '22K') {
  return `1 Sovereign · ${purity} · 8 g`;
}
