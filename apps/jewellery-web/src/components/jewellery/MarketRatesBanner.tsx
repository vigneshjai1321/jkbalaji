
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
};

function fmt(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatWhen(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

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

  if (!data?.configured || (!data.gold && !data.silver)) {
    return (
      <section className="jw-section bg-amber-50/60 border-y border-amber-100">
        <div className="jw-container max-w-3xl text-center text-sm text-stone-600">
          <p>Live market rates will appear here after our daily GoldAPI update is configured on the server.</p>
        </div>
      </section>
    );
  }

  const updated = formatWhen(data.fetchedAt);

  return (
    <section className="jw-section bg-gradient-to-b from-amber-50/90 to-[#faf8f4] border-y border-amber-100/80" aria-labelledby="market-rates-heading">
      <div className="jw-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 id="market-rates-heading" className="jw-heading text-xl md:text-2xl font-semibold text-stone-900">
              Today&apos;s Market Benchmarks
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Source: {data.provider} · {data.currency} · {data.unit}
              {updated ? ` · Last updated ${updated}` : null}
            </p>
          </div>
          {data.isStale && data.staleMessage ? (
            <p className="text-sm text-amber-900 bg-amber-100/80 border border-amber-200 rounded-lg px-3 py-2 max-w-md">
              {data.staleMessage}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.gold?.price24kPerGram != null ? (
            <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-800">Gold 24K / gram</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.gold.price24kPerGram)}</p>
            </div>
          ) : null}
          {data.gold?.price22kPerGram != null ? (
            <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-800">Gold 22K / gram</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.gold.price22kPerGram)}</p>
            </div>
          ) : null}
          {data.gold?.price18kPerGram != null ? (
            <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-800">Gold 18K / gram</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.gold.price18kPerGram)}</p>
            </div>
          ) : null}
          {data.silver?.pricePerGram != null ? (
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-stone-600">Silver / gram</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.silver.pricePerGram)}</p>
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-xs text-stone-500 leading-relaxed max-w-3xl">{data.disclaimer}</p>
        {data.gold?.purityNote ? <p className="mt-2 text-xs text-stone-500 max-w-3xl">{data.gold.purityNote}</p> : null}
      </div>
    </section>
  );
}
