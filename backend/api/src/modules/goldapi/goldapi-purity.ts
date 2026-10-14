/** Troy ounce → grams (ISO standard). Used only when API does not return gram fields. */
export const TROY_OZ_GRAMS = 31.1034768;

export function inrPerGramFromTroyOz(pricePerTroyOz: number): number {
  return pricePerTroyOz / TROY_OZ_GRAMS;
}

/** Documented purity factor: karat / 24 on 24K pure gold gram rate. */
export function karatFrom24k(rate24kPerGram: number, karat: 22 | 18): number {
  return rate24kPerGram * (karat / 24);
}

export const PURITY_CALC_NOTE =
  '22K and 18K values use GoldAPI 24K per-gram data when provided; otherwise they are calculated as (karat ÷ 24) × 24K. These are market benchmarks, not showroom selling prices.';
