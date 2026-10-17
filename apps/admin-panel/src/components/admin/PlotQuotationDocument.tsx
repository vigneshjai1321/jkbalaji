'use client';

import { formatInr, formatSqft } from '@/lib/plot-currency';

const RE_LOGO = '/assets/logos/realestate-logo.svg';

export type PlotQuotationDocProps = {
  projectName: string;
  plotNumber: string;
  areaSqft: string | null;
  pricePerSqftInr: string;
  basePlotPriceInr: string;
  additionalTotalInr: string;
  estimatedTotalInr: string;
  validUntil: string | null;
  documentDate: string;
  customer: { name: string; phone: string; email?: string | null; address?: string | null };
  broker: { name: string; phone: string } | null;
  commissionExpectedInr: string | null;
  commissionPaidBy: string | null;
  charges: Array<{ label: string; amountInr: string }>;
  notes: string | null;
  terms: string | null;
  companyLine?: string;
};

export function PlotQuotationDocument(props: PlotQuotationDocProps) {
  const {
    projectName,
    plotNumber,
    areaSqft,
    pricePerSqftInr,
    basePlotPriceInr,
    estimatedTotalInr,
    validUntil,
    documentDate,
    customer,
    broker,
    commissionExpectedInr,
    commissionPaidBy,
    charges,
    notes,
    terms,
    companyLine = 'JK Balaji — Real Estate',
  } = props;

  return (
    <article className="plot-quotation-sheet mx-auto max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow print:shadow-none">
      <div className="px-8 pt-8 pb-6 md:px-12 print:px-12">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b-2 border-[#1e3a5f] pb-5">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={RE_LOGO} alt="JK Balaji" className="h-14 w-14 object-contain shrink-0" />
            <div>
              <p className="text-lg font-bold tracking-tight text-[#1e3a5f]">{companyLine}</p>
              <p className="text-xs uppercase tracking-widest text-slate-500 mt-0.5">Plot quotation</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-[#1e3a5f]">{projectName}</p>
            <p className="text-slate-600 mt-1">Date: {documentDate}</p>
            {validUntil ? <p className="text-slate-600">Valid until: {validUntil.slice(0, 10)}</p> : null}
          </div>
        </header>

        <p className="text-[11px] uppercase tracking-wide text-amber-800/90 mt-4 font-medium">Quotation — not a sale deed or tax invoice</p>

        <section className="grid sm:grid-cols-2 gap-6 text-sm mt-6 mb-8">
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#1e3a5f]">Customer</h2>
            <p className="mt-2 font-semibold">{customer.name}</p>
            <p className="text-slate-700">{customer.phone}</p>
            {customer.email ? <p className="text-slate-700">{customer.email}</p> : null}
            {customer.address ? <p className="text-slate-600 whitespace-pre-line text-xs mt-1">{customer.address}</p> : null}
          </div>
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#1e3a5f]">Plot details</h2>
            <p className="mt-2">
              Plot no. <span className="font-semibold">{plotNumber}</span>
            </p>
            <p>Area: {formatSqft(areaSqft)} sq ft</p>
            <p>Rate: {formatInr(pricePerSqftInr)} / sq ft</p>
            <p className="mt-1 font-medium">Base plot price: {formatInr(basePlotPriceInr)}</p>
          </div>
        </section>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#1e3a5f] text-white text-left text-xs uppercase tracking-wide">
              <th className="py-2.5 px-3 font-semibold">Description</th>
              <th className="py-2.5 px-3 font-semibold text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-2.5 px-3">Base plot price</td>
              <td className="py-2.5 px-3 text-right tabular-nums">{formatInr(basePlotPriceInr)}</td>
            </tr>
            {charges.map((c) => (
              <tr key={c.label} className="border-b border-slate-200">
                <td className="py-2.5 px-3">{c.label}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatInr(c.amountInr)}</td>
              </tr>
            ))}
            <tr className="font-bold text-base bg-slate-50">
              <td className="py-3 px-3 text-[#1e3a5f]">Estimated total payable</td>
              <td className="py-3 px-3 text-right tabular-nums text-[#1e3a5f]">{formatInr(estimatedTotalInr)}</td>
            </tr>
          </tbody>
        </table>

        {broker ? (
          <section className="text-sm mt-6 rounded-lg border border-slate-200 p-3 bg-white break-inside-avoid">
            <h2 className="text-xs font-bold uppercase text-slate-600">Broker (reference)</h2>
            <p className="mt-1">
              {broker.name} · {broker.phone}
            </p>
            {commissionExpectedInr ? (
              <p className="text-xs text-slate-600 mt-1">
                Indicative commission on quotation: {formatInr(commissionExpectedInr)}
                {commissionPaidBy ? ` (${commissionPaidBy === 'BUYER' ? 'buyer' : 'seller'} side)` : ''}
              </p>
            ) : null}
          </section>
        ) : null}

        {notes ? <p className="text-sm mt-4 text-slate-700">{notes}</p> : null}

        <footer className="mt-10 pt-4 border-t border-slate-300 text-xs text-slate-600 break-inside-avoid">
          <p>{terms ?? 'Figures are estimates until verified with registration authorities.'}</p>
          <p className="mt-6 text-slate-500">Authorized signatory</p>
          <div className="mt-8 h-10 border-b border-slate-400 w-48" />
        </footer>
      </div>
    </article>
  );
}
