import { MarketRatesPanel } from './MarketRatesPanel';

export type MarketRatesResponse = {
  provider: string;
  currency: string;
  unit: string;
  disclaimer: string;
  fetchedAt: string | null;
  isStale: boolean;
  staleMessage: string | null;
  configured: boolean;
  gold: {
    price24kPerGram: number | null;
    price22kPerGram: number | null;
    price18kPerGram: number | null;
    purityNote: string;
  } | null;
  silver: { pricePerGram: number | null } | null;
  kjpl?: {
    goldWithoutGstInr: number;
    goldWithGstInr: number | null;
    silverWithoutGstInr: number;
    silverWithGstInr: number | null;
    sourceUpdatedAtText: string | null;
  } | null;
};

async function fetchMarketRates(): Promise<MarketRatesResponse | null> {
  const pub = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const base = pub ?? process.env.SERVER_API_URL ?? 'http://127.0.0.1:4000/api/v1';
  try {
    const res = await fetch(`${base}/public/jewellery/market-rates`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as MarketRatesResponse;
  } catch {
    return null;
  }
}

export async function MarketRatesBanner() {
  const data = await fetchMarketRates();
  const hasRates =
    data?.configured &&
    (data.kjpl || data.gold?.price24kPerGram != null || data.silver?.pricePerGram != null);

  if (!hasRates) {
    return (
      <section className="jw-section bg-amber-50/60 border-y border-amber-100">
        <div className="jw-container max-w-3xl text-center text-sm text-stone-600">
          <p className="font-medium text-stone-800">Rate currently unavailable</p>
          <p className="mt-2">
            Reference rates appear when the server is configured with GoldAPI (<code className="text-xs">GOLDAPI_ACCESS_TOKEN</code>)
            or KJPL polling (<code className="text-xs">KJPL_RATES_ENABLED=true</code>, <code className="text-xs">MARKET_RATES_SOURCE=kjpl</code>).
            Shop selling prices are confirmed in the showroom.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="jw-section bg-gradient-to-b from-amber-50/90 to-[#faf8f4] border-y border-amber-100/80"
      aria-labelledby="market-rates-heading"
    >
      <div id="market-rates-heading" className="sr-only">
        Market rates
      </div>
      <MarketRatesPanel data={data!} />
    </section>
  );
}
