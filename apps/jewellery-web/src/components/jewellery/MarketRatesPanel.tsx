import type { MarketRatesResponse } from './MarketRatesBanner';

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

export function MarketRatesPanel({ data, compact }: { data: MarketRatesResponse; compact?: boolean }) {
  const updated = formatWhen(data.fetchedAt);
  const isKjpl = data.provider === 'kjpl.in' && data.kjpl;

  return (
    <div className={compact ? '' : 'jw-container'}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="jw-heading text-xl md:text-2xl font-semibold text-stone-900">
            {compact ? "Today's reference rates" : "Today's Market Benchmarks"}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Source: {data.provider}
            {data.unit ? ` · ${data.unit}` : null}
            {updated ? ` · Last fetched ${updated}` : null}
            {data.kjpl?.sourceUpdatedAtText ? ` · KJPL page: ${data.kjpl.sourceUpdatedAtText}` : null}
          </p>
        </div>
        {data.isStale && data.staleMessage ? (
          <p className="text-sm text-amber-900 bg-amber-100/80 border border-amber-200 rounded-lg px-3 py-2 max-w-md">
            {data.staleMessage}
          </p>
        ) : null}
      </div>

      {isKjpl ? (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-amber-800">Gold MJDTA (excl. GST)</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.kjpl!.goldWithoutGstInr)}</p>
          </div>
          {data.kjpl!.goldWithGstInr != null ? (
            <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-800">Gold MJDTA (incl. GST)</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.kjpl!.goldWithGstInr)}</p>
            </div>
          ) : null}
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-stone-600">Silver MJDTA (excl. GST)</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.kjpl!.silverWithoutGstInr)}</p>
          </div>
          {data.kjpl!.silverWithGstInr != null ? (
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-stone-600">Silver MJDTA (incl. GST)</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.kjpl!.silverWithGstInr)}</p>
            </div>
          ) : null}
        </div>
      ) : (
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
          {data.silver?.pricePerGram != null ? (
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-stone-600">Silver / gram</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">₹{fmt(data.silver.pricePerGram)}</p>
            </div>
          ) : null}
        </div>
      )}

      <p className="mt-4 text-xs text-stone-500 leading-relaxed max-w-3xl">{data.disclaimer}</p>
      {data.gold?.purityNote ? <p className="mt-2 text-xs text-stone-500 max-w-3xl">{data.gold.purityNote}</p> : null}
    </div>
  );
}
