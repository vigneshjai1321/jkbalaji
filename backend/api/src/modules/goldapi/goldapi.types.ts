export type GoldApiMetal = 'XAU' | 'XAG';

/** Parsed GoldAPI.io /api/price/{metal}/INR response (fields vary by plan). */
export type GoldApiPriceResponse = {
  timestamp?: number;
  metal?: string;
  currency?: string;
  price?: number;
  price_gram_24k?: number;
  price_gram_22k?: number;
  price_gram_18k?: number;
  price_gram?: number;
  unit?: string;
};

export type PublicMarketRatesDto = {
  provider: string;
  currency: string;
  unit: string;
  disclaimer: string;
  fetchedAt: string | null;
  sourceTimestampGold: string | null;
  sourceTimestampSilver: string | null;
  isStale: boolean;
  staleMessage: string | null;
  schedulerEnabled: boolean;
  configured: boolean;
  gold: {
    price24kPerGram: number | null;
    price22kPerGram: number | null;
    price18kPerGram: number | null;
    purityNote: string;
  } | null;
  silver: {
    pricePerGram: number | null;
  } | null;
  usage: {
    yearMonth: string;
    requestCount: number;
    monthlyLimit: number;
  };
};
