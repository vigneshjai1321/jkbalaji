'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

export function BillingFormCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-stone-200/90 bg-white/95 shadow-sm shadow-stone-200/40',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BillingFormSection({
  title,
  subtitle,
  icon: Icon,
  children,
  step,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  step?: number;
}) {
  return (
    <BillingFormCard className="p-4 md:p-5">
      <div className="flex items-start gap-3 mb-4">
        {step != null ? (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-900 text-sm font-semibold border border-amber-200/80"
            aria-hidden
          >
            {step}
          </span>
        ) : Icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-stone-900 tracking-tight">{title}</h2>
          {subtitle ? <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </BillingFormCard>
  );
}

export function BillingAlert({
  tone,
  children,
}: {
  tone: 'error' | 'warn' | 'info' | 'success';
  children: React.ReactNode;
}) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-950',
    info: 'border-sky-200 bg-sky-50 text-sky-950',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  return <p className={clsx('text-sm rounded-lg border px-3 py-2.5 mb-3', tones[tone])}>{children}</p>;
}

export function InvoiceSummaryCard({
  totalsLoading,
  totals,
  gstApplied,
  taxableInr,
  amountPaid,
  balanceDue,
}: {
  totalsLoading: boolean;
  totals: {
    subtotalInr: number;
    discountInr: number;
    cgstInr: number;
    sgstInr: number;
    igstInr: number;
    totalInr: number;
  } | null;
  gstApplied: boolean;
  taxableInr: number | null;
  amountPaid: number;
  balanceDue: number | null;
}) {
  return (
    <BillingFormCard className="p-4 md:p-5 border-amber-200/60 bg-gradient-to-b from-amber-50/40 to-white">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900/80 mb-3">Invoice summary</h2>
      {totalsLoading ? <p className="text-sm text-stone-500">Calculating totals…</p> : null}
      {!totals && !totalsLoading ? (
        <p className="text-sm text-stone-500">Select a customer and add jewellery items to see totals.</p>
      ) : null}
      {totals ? (
        <dl className="space-y-2 text-sm">
          <SummaryRow label="Subtotal" value={totals.subtotalInr} />
          {totals.discountInr > 0 ? <SummaryRow label="Discount" value={totals.discountInr} /> : null}
          <SummaryRow label="Taxable amount" value={taxableInr ?? 0} />
          {gstApplied && totals.cgstInr > 0 ? (
            <>
              <SummaryRow label="CGST" value={totals.cgstInr} />
              <SummaryRow label="SGST" value={totals.sgstInr} />
            </>
          ) : null}
          {gstApplied && totals.igstInr > 0 ? <SummaryRow label="IGST" value={totals.igstInr} /> : null}
          <div className="pt-3 mt-2 border-t-2 border-amber-300/70">
            <div className="flex justify-between gap-3 items-baseline">
              <dt className="text-base font-semibold text-stone-900">Amount payable</dt>
              <dd className="text-xl font-bold tabular-nums text-amber-950">
                ₹{totals.totalInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </dd>
            </div>
          </div>
          {amountPaid > 0 ? (
            <>
              <SummaryRow label="Amount paid" value={amountPaid} />
              <SummaryRow label="Balance due" value={balanceDue ?? totals.totalInr} strong />
            </>
          ) : null}
        </dl>
      ) : null}
    </BillingFormCard>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={clsx('flex justify-between gap-3', strong ? 'font-semibold text-stone-900' : '')}>
      <dt className={strong ? undefined : 'text-stone-500'}>{label}</dt>
      <dd className="tabular-nums text-stone-800">
        ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </dd>
    </div>
  );
}
