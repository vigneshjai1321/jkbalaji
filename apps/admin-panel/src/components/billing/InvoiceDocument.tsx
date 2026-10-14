'use client';

import type { SellerProfile } from '@/lib/billing-types';
import { amountInWordsInr } from '@/lib/amount-in-words';
import type { InvoicePrintLayout } from '@/lib/invoice-print-layout';

type Line = {
  description: string;
  hsnSac?: string | null;
  unit?: string | null;
  qty: string | number;
  rateInr: string | number;
  discountInr?: string | number;
  taxableInr?: string | number;
  cgstInr?: string | number;
  sgstInr?: string | number;
  igstInr?: string | number;
  amountInr: string | number;
};

export type InvoiceDocumentProps = {
  seller: SellerProfile;
  invoiceNo: string;
  status: string;
  gstApplied?: boolean;
  invoiceDate: string;
  dueDate?: string | null;
  customer: { name: string; phone: string; email?: string | null; address?: string | null; gstin?: string | null };
  lines: Line[];
  subtotalInr: string | number;
  discountInr?: string | number;
  cgstInr: string | number;
  sgstInr: string | number;
  igstInr?: string | number;
  totalInr: string | number;
  amountPaidInr?: string | number;
  paymentTerms?: string | null;
  notes?: string | null;
  layout?: InvoicePrintLayout;
};

function n(v: string | number | undefined | null) {
  return Number(v ?? 0);
}

function fmt(v: string | number | undefined | null) {
  return n(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ShopBillHeader({ seller, gst, compact }: { seller: SellerProfile; gst: boolean; compact: boolean }) {
  const shopTitle = (seller.tradeName || seller.legalName || '—').toUpperCase();
  const contactLine = [seller.phone, seller.email].filter(Boolean).join(' · ');
  if (compact) {
    return (
      <header className="text-center border-b border-slate-800 pb-1.5 mb-1.5">
        {seller.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={seller.logoUrl} alt="" className="h-8 mx-auto object-contain mb-0.5" />
        ) : null}
        <p className="font-bold text-[11px] tracking-wide text-slate-900">{shopTitle}</p>
        {seller.address ? <p className="text-[8px] text-slate-600 leading-tight">{seller.address.replace(/\n/g, ', ')}</p> : null}
        {contactLine ? <p className="text-[8px] text-slate-600">{contactLine}</p> : null}
        {gst && seller.gstin ? <p className="text-[8px] text-slate-600">GSTIN {seller.gstin}</p> : null}
      </header>
    );
  }
  return (
    <header className="text-center border-b border-slate-200 pb-2 mb-3">
      {seller.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={seller.logoUrl} alt="" className="h-12 mx-auto object-contain mb-1" />
      ) : null}
      <h1 className="text-base font-bold tracking-wide text-slate-900">{shopTitle}</h1>
      {seller.legalName && seller.legalName !== seller.tradeName ? (
        <p className="text-[9px] text-slate-600">{seller.legalName}</p>
      ) : null}
      {seller.address ? <p className="text-[10px] text-slate-600 whitespace-pre-line max-w-md mx-auto">{seller.address}</p> : null}
      {contactLine ? <p className="text-[10px] text-slate-600 mt-0.5">{contactLine}</p> : null}
      {gst && seller.gstin ? <p className="text-[10px] mt-0.5">GSTIN: {seller.gstin}</p> : null}
    </header>
  );
}

function TotalsBlock({
  props,
  compact,
  gst,
  balance,
}: {
  props: InvoiceDocumentProps;
  compact: boolean;
  gst: boolean;
  balance: number;
}) {
  const row = compact ? 'flex justify-between gap-2 text-[9px]' : 'flex justify-between gap-2';
  const grand = compact ? 'flex justify-between font-bold border-t border-slate-300 pt-0.5 mt-0.5 text-[10px]' : 'flex justify-between font-bold text-sm border-t border-slate-200 pt-1';

  return (
    <dl className={compact ? 'space-y-0.5 w-full max-w-[72mm] ml-auto' : 'w-full max-w-xs space-y-0.5'}>
      <div className={row}>
        <dt>Subtotal</dt>
        <dd className="tabular-nums">₹ {fmt(props.subtotalInr)}</dd>
      </div>
      {n(props.discountInr) > 0 ? (
        <div className={row}>
          <dt>Discount</dt>
          <dd className="tabular-nums">₹ {fmt(props.discountInr)}</dd>
        </div>
      ) : null}
      {gst && n(props.cgstInr) > 0 ? (
        <>
          <div className={row}>
            <dt>CGST</dt>
            <dd className="tabular-nums">₹ {fmt(props.cgstInr)}</dd>
          </div>
          <div className={row}>
            <dt>SGST</dt>
            <dd className="tabular-nums">₹ {fmt(props.sgstInr)}</dd>
          </div>
        </>
      ) : null}
      {gst && n(props.igstInr) > 0 ? (
        <div className={row}>
          <dt>IGST</dt>
          <dd className="tabular-nums">₹ {fmt(props.igstInr)}</dd>
        </div>
      ) : null}
      <div className={grand}>
        <dt>Grand Total</dt>
        <dd className="tabular-nums">₹ {fmt(props.totalInr)}</dd>
      </div>
      {!compact ? <p className="text-[9px] italic text-slate-600 text-right">{amountInWordsInr(props.totalInr)}</p> : null}
      {n(props.amountPaidInr) > 0 || !compact ? (
        <>
          <div className={row}>
            <dt>Paid</dt>
            <dd className="tabular-nums">₹ {fmt(props.amountPaidInr)}</dd>
          </div>
          <div className={`${row} font-semibold`}>
            <dt>Balance</dt>
            <dd className="tabular-nums">₹ {fmt(balance)}</dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

export function InvoiceDocument(props: InvoiceDocumentProps) {
  const gst = props.gstApplied !== false;
  const balance = Math.max(0, n(props.totalInr) - n(props.amountPaidInr));
  const displayName = props.seller.tradeName || props.seller.legalName || '—';
  const compact = props.layout === 'compact';
  const showBank = Boolean(props.seller.bankDetails?.trim()) && (!compact || props.lines.length <= 4);
  const showSignatory = !compact || props.status === 'ISSUED' || props.status === 'PAID';

  if (compact) {
    return (
      <article className="invoice-compact mx-auto bg-white text-slate-900 shadow-lg print:shadow-none">
        <div className="invoice-compact-inner">
          <ShopBillHeader seller={props.seller} gst={gst} compact />
          <div className="flex justify-between text-[8px] border-b border-slate-200 pb-1 mb-1.5">
            <p className="font-bold text-emerald-900">{gst ? 'TAX INVOICE' : 'BILL'}</p>
            <div className="text-right">
              <p>
                <span className="text-slate-500">No </span>
                {props.invoiceNo}
              </p>
              <p>
                <span className="text-slate-500">Date </span>
                {new Date(props.invoiceDate).toLocaleDateString('en-IN')}
              </p>
              {props.dueDate ? (
                <p>
                  <span className="text-slate-500">Due </span>
                  {new Date(props.dueDate).toLocaleDateString('en-IN')}
                </p>
              ) : null}
            </div>
          </div>

          <section className="text-[8px] border-b border-slate-200 pb-1 mb-1.5">
            <span className="font-semibold text-slate-700">Bill To: </span>
            <span className="font-medium">{props.customer.name}</span>
            <span className="text-slate-600"> · {props.customer.phone}</span>
            {props.customer.gstin ? <span className="text-slate-600"> · GSTIN {props.customer.gstin}</span> : null}
            {props.customer.address ? <p className="text-slate-600 mt-0.5">{props.customer.address.replace(/\n/g, ', ')}</p> : null}
          </section>

          <table className="w-full border-collapse text-[8px] mb-1.5">
            <thead>
              <tr className="border-y border-slate-800 bg-slate-50">
                <th className="text-left py-0.5 pr-1 font-semibold">Item</th>
                {gst ? <th className="text-left py-0.5 px-0.5 font-semibold w-[14%]">HSN</th> : null}
                <th className="text-right py-0.5 px-0.5 font-semibold w-[10%]">Qty</th>
                <th className="text-right py-0.5 px-0.5 font-semibold w-[14%]">Rate</th>
                <th className="text-right py-0.5 pl-1 font-semibold w-[16%]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {props.lines.map((l, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-0.5 pr-1 align-top">{l.description}</td>
                  {gst ? <td className="py-0.5 px-0.5 align-top">{l.hsnSac ?? '—'}</td> : null}
                  <td className="py-0.5 px-0.5 text-right tabular-nums align-top">
                    {l.qty} {l.unit ?? 'nos'}
                  </td>
                  <td className="py-0.5 px-0.5 text-right tabular-nums align-top">{fmt(l.rateInr)}</td>
                  <td className="py-0.5 pl-1 text-right tabular-nums align-top font-medium">{fmt(l.amountInr)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t border-slate-300 pt-1">
            <TotalsBlock props={props} compact gst={gst} balance={balance} />
          </div>

          {(showBank || props.paymentTerms || props.notes || props.seller.invoiceFooter) && (
            <footer className="mt-1.5 pt-1 border-t border-slate-200 text-[7.5px] text-slate-600 space-y-0.5">
              {showBank ? <p className="whitespace-pre-line">{props.seller.bankDetails}</p> : null}
              {props.paymentTerms ? <p>Terms: {props.paymentTerms}</p> : null}
              {props.notes ? <p>Note: {props.notes}</p> : null}
              {props.seller.invoiceFooter ? <p>{props.seller.invoiceFooter}</p> : null}
            </footer>
          )}

          {showSignatory ? (
            <p className="text-[7px] text-slate-500 mt-2 text-right">Authorised signatory</p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="invoice-a4 mx-auto bg-white text-slate-900 shadow-xl print:shadow-none text-[11px] leading-snug">
      <ShopBillHeader seller={props.seller} gst={gst} compact={false} />
      <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-2 mb-3 text-[11px]">
        <p className="font-bold text-emerald-900">{gst ? 'TAX INVOICE' : 'INVOICE / BILL'}</p>
        <div className="text-right">
          <p>No: {props.invoiceNo}</p>
          <p>Date: {new Date(props.invoiceDate).toLocaleDateString('en-IN')}</p>
          {props.dueDate ? <p>Due: {new Date(props.dueDate).toLocaleDateString('en-IN')}</p> : null}
          <p className="uppercase tracking-wide text-slate-500 text-[10px]">{props.status.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <section className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[11px]">
        <p className="font-semibold text-slate-800">Bill To</p>
        <p className="font-medium">{props.customer.name}</p>
        <p className="text-slate-600">{props.customer.phone}</p>
        {props.customer.email ? <p className="text-slate-600">{props.customer.email}</p> : null}
        {props.customer.address ? <p className="text-slate-600 whitespace-pre-line">{props.customer.address}</p> : null}
        {props.customer.gstin ? <p className="text-slate-600">GSTIN: {props.customer.gstin}</p> : null}
      </section>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-emerald-800 text-white text-[10px]">
              <th className="text-left p-1.5">Description</th>
              {gst ? <th className="text-left p-1.5">HSN/SAC</th> : null}
              <th className="text-right p-1.5">Qty</th>
              <th className="text-right p-1.5">Unit</th>
              <th className="text-right p-1.5">Rate</th>
              <th className="text-right p-1.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {props.lines.map((l, i) => (
              <tr key={i} className={i % 2 ? 'bg-slate-50' : ''}>
                <td className="p-1.5">{l.description}</td>
                {gst ? <td className="p-1.5">{l.hsnSac ?? '—'}</td> : null}
                <td className="p-1.5 text-right tabular-nums">{l.qty}</td>
                <td className="p-1.5 text-right">{l.unit ?? 'nos'}</td>
                <td className="p-1.5 text-right tabular-nums">{fmt(l.rateInr)}</td>
                <td className="p-1.5 text-right tabular-nums">{fmt(l.amountInr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-end">
        <TotalsBlock props={props} compact={false} gst={gst} balance={balance} />
      </div>

      <footer className="mt-6 text-[10px] text-slate-600 space-y-1 print:mt-4">
        {props.seller.bankDetails?.trim() ? <p className="whitespace-pre-line">Bank: {props.seller.bankDetails}</p> : null}
        {props.paymentTerms ? <p>Payment terms: {props.paymentTerms}</p> : null}
        {props.notes ? <p>Notes: {props.notes}</p> : null}
        {props.seller.invoiceFooter ? <p>{props.seller.invoiceFooter}</p> : null}
        <p className="pt-4">Authorised Signatory</p>
        <p className="border-t border-slate-400 w-40 pt-0.5">{displayName}</p>
      </footer>
    </article>
  );
}
