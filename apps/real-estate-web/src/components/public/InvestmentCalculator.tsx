'use client';

import { useMemo, useState } from 'react';

export function InvestmentCalculator() {
  const [plotCost, setPlotCost] = useState(2500000);
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(3);
  const [appreciation, setAppreciation] = useState(8);

  const result = useMemo(() => {
    const down = (plotCost * downPct) / 100;
    const loan = plotCost - down;
    const future = plotCost * (1 + appreciation / 100) ** years;
    const gain = future - plotCost;
    return { down, loan, future, gain };
  }, [plotCost, downPct, years, appreciation]);

  return (
    <div className="glass-panel-light rounded-2xl border border-emerald-100 p-6 md:p-8 shadow-lg">
      <h3 className="text-xl font-bold text-emerald-900">Property Investment Calculator</h3>
      <p className="text-sm text-slate-600 mt-1">Estimate down payment and projected appreciation (indicative only).</p>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm">
            Plot cost (₹)
            <input
              type="range"
              min={500000}
              max={15000000}
              step={100000}
              value={plotCost}
              onChange={(e) => setPlotCost(Number(e.target.value))}
              className="w-full mt-1 accent-emerald-700"
            />
            <span className="font-semibold">₹{plotCost.toLocaleString('en-IN')}</span>
          </label>
          <label className="block text-sm">
            Down payment ({downPct}%)
            <input
              type="range"
              min={10}
              max={50}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full mt-1 accent-emerald-700"
            />
          </label>
          <label className="block text-sm">
            Hold period ({years} yrs)
            <input
              type="range"
              min={1}
              max={10}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full mt-1 accent-emerald-700"
            />
          </label>
          <label className="block text-sm">
            Expected appreciation ({appreciation}% p.a.)
            <input
              type="range"
              min={3}
              max={15}
              value={appreciation}
              onChange={(e) => setAppreciation(Number(e.target.value))}
              className="w-full mt-1 accent-emerald-700"
            />
          </label>
        </div>
        <div className="rounded-xl bg-emerald-900 text-emerald-50 p-5 space-y-3">
          <p className="text-sm text-emerald-200">Down payment</p>
          <p className="text-2xl font-bold">₹{result.down.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-sm text-emerald-200 pt-2">Balance to finance</p>
          <p className="text-lg font-semibold">₹{result.loan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-sm text-emerald-200 pt-2">Indicative value after {years} years</p>
          <p className="text-2xl font-bold">₹{result.future.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-emerald-300/80">Projected gain: ₹{result.gain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </div>
  );
}
