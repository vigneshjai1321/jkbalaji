'use client';

import { useMemo, useState } from 'react';
import { ContactLeadForm } from '@/components/ContactLeadForm';

const PRESETS = [5_000, 10_000, 15_000, 20_000, 25_000, 50_000, 75_000, 100_000] as const;
const MIN = 5_000;
const MAX = 100_000;

function fmt(n: number) {
  return n.toLocaleString('en-IN');
}

export function GoldSchemeEnquiry() {
  const [amount, setAmount] = useState<number>(10_000);
  const [custom, setCustom] = useState('');

  const effective = useMemo(() => {
    if (custom.trim()) {
      const n = Number(custom.replace(/,/g, ''));
      if (Number.isFinite(n)) return Math.min(MAX, Math.max(MIN, Math.round(n)));
    }
    return amount;
  }, [amount, custom]);

  const amountValid = effective >= MIN && effective <= MAX;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="jw-heading text-xl font-semibold text-stone-900">Choose a contribution amount</h2>
        <p className="mt-2 text-sm text-stone-600">
          Select ₹5,000 to ₹1,00,000 as your preferred planning amount. Final scheme rules, duration, and enrolment are confirmed
          in the showroom — we do not promise returns or bonuses online.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setAmount(p);
                setCustom('');
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                effective === p && !custom.trim()
                  ? 'bg-amber-800 text-white border-amber-800'
                  : 'bg-white text-stone-800 border-amber-200 hover:border-amber-400'
              }`}
            >
              ₹{fmt(p)}
            </button>
          ))}
        </div>
        <label className="mt-6 block text-sm font-medium text-stone-700">
          Custom amount (₹{fmt(MIN)} – ₹{fmt(MAX)})
          <input
            type="number"
            min={MIN}
            max={MAX}
            step={500}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. 30000"
            className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900"
          />
        </label>
        <p className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-stone-700">
          Summary: you are enquiring about a <strong>₹{fmt(effective)}</strong> contribution level. Payment and enrolment are not
          completed on this website.
        </p>
        {!amountValid ? (
          <p className="mt-2 text-sm text-red-700">Enter an amount between ₹5,000 and ₹1,00,000.</p>
        ) : null}
      </div>
      <div className="jw-card p-6 md:p-8">
        <h3 className="font-semibold text-stone-900">Enquire about the scheme</h3>
        <p className="mt-2 text-sm text-stone-600">Our team will call you with approved plan details. No online payment on this form.</p>
        {amountValid ? (
          <ContactLeadForm leadType="GOLD_SCHEME_ENQUIRY" sourcePage="/gold-schemes" schemeAmountInr={effective} />
        ) : (
          <p className="mt-6 text-sm text-stone-500">Fix the amount above to submit.</p>
        )}
      </div>
    </div>
  );
}
