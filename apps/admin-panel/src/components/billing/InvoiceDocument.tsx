'use client';

import type { SellerProfile } from '@/lib/billing-types';
import { amountInWordsInr } from '@/lib/amount-in-words';
import { gstinFormatHint } from '@/lib/gstin-format';

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
};

function n(v: string | number | undefined | null) {
  return Number(v ?? 0);
}

function fmt(v: string | number | undefined | null) {
  return n(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SellerHeader({ seller, gst }: { seller: SellerProfile; gst: boolean }) {
  const shopTitle = (seller.tradeName || seller.legalName || '—').toUpperCase();
  const gstHint = gst && seller.gstin ? gstinFormatHint(seller.gstin) : null;

  return (
    <header className="text-center border-b border-slate-300 pb-3 mb-4">
      {seller.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={seller.logoUrl} alt="" className="h-14 mx-auto object-contain mb-2" />
      ) : null}
      <h1 className="text-lg font-semibold tracking-[0.12em] text-slate-900">{shopTitle}</h1>
      {seller.legalName && seller.legalName.toUpperCase() !== shopTitle ? (
        <p className="text-[10px] text-slate-600 mt-0.5">{seller.legalName}</p>
      ) : null}
      {seller.address ? (
        <p className="text-[11px] text-slate-700 whitespace-pre-line max-w-lg mx-auto mt-1 leading-snug">{seller.address}</p>
      ) : null}
      <div className="text-[11px] text-slate-700 mt-1.5 space-y-0.5">
        {seller.phone ? <p>Phone: {seller.phone}</p> : null}
        {seller.email ? <p>{seller.email}</p> : null}
        {gst && seller.gstin ? (
          <p>
            GSTIN: <span className="font-medium tracking-wide">{seller.gstin.toUpperCase()}</span>
            {gstHint ? <span className="block text-amber-700 text-[10px] mt-0.5">{gstHint}</span> : null}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function InvoiceDocument(props: InvoiceDocumentProps) {
  const gst = props.gstApplied !== false;
  const balance = Math.max(0, n(props.totalInr) - n(props.amountPaidInr));
  const docTitle = gst ? 'TAX INVOICE' : 'INVOICE';
  const showStatus = !['PREVIEW', 'SAMPLE'].includes(props.status);

  return (
    <article className="invoice-a4 mx-auto bg-white text-slate-900 shadow-lg print:shadow-none">
      <SellerHeader seller={props.seller} gst={gst} />

      <div className="flex flex-wrap justify-between gap-3 border-b border-slate-200 pb-2 mb-3 text-[11px]">
        <p className="font-semibold text-slate-800 tracking-wide">{docTitle}</p>
        <div className="text-right tabular-nums">
          <p>
            <span className="text-slate-500">Invoice No. </span>
            <span className="font-medium">{props.invoiceNo}</span>
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
          {showStatus ? <p className="text-[10px] uppercase text-slate-500 mt-0.5">{props.status.replace(/_/g, ' ')}</p> : null}
        </div>
      </div>

      <section className="mb-4 text-[11px] border border-slate-200 rounded-sm p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Bill To</p>
        <p className="font-medium text-slate-900">{props.customer.name}</p>
        <p className="text-slate-700">{props.customer.phone}</p>
        {props.customer.email ? <p className="text-slate-700">{props.customer.email}</p> : null}
        {props.customer.address ? <p className="text-slate-700 whitespace-pre-line mt-0.5">{props.customer.address}</p> : null}
        {props.customer.gstin ? <p className="text-slate-700 mt-0.5">GSTIN: {props.customer.gstin.toUpperCase()}</p> : null}
      </section>

      <div className="overflow-x-auto">
        <table className="invoice-lines w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-y border-slate-400 text-[10px]">
              <th className="text-left py-1.5 pr-2 font-semibold text-slate-700">Description</th>
              {gst ? <th className="text-left py-1.5 px-1 font-semibold text-slate-700 w-[12%]">HSN/SAC</th> : null}
              <th className="text-right py-1.5 px-1 font-semibold text-slate-700 w-[10%]">Qty</th>
              <th className="text-right py-1.5 px-1 font-semibold text-slate-700 w-[10%]">Unit</th>
              <th className="text-right py-1.5 px-1 font-semibold text-slate-700 w-[14%]">Rate (₹)</th>
              {gst ? <th className="text-right py-1.5 px-1 font-semibold text-slate-700 w-[14%]">Taxable (₹)</th> : null}
              <th className="text-right py-1.5 pl-1 font-semibold text-slate-700 w-[14%]">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {props.lines.map((l, i) => (
              <tr key={i} className="border-b border-slate-100 align-top">
                <td className="py-1.5 pr-2">{l.description}</td>
                {gst ? <td className="py-1.5 px-1 text-slate-700">{l.hsnSac ?? '—'}</td> : null}
                <td className="py-1.5 px-1 text-right tabular-nums">{l.qty}</td>
                <td className="py-1.5 px-1 text-right text-slate-700">{l.unit ?? 'nos'}</td>
                <td className="py-1.5 px-1 text-right tabular-nums">{fmt(l.rateInr)}</td>
                {gst ? <td className="py-1.5 px-1 text-right tabular-nums">{fmt(l.taxableInr ?? l.amountInr)}</td> : null}
                <td className="py-1.5 pl-1 text-right tabular-nums font-medium">{fmt(l.amountInr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <dl className="w-full max-w-sm space-y-1 text-[11px] border-t border-slate-300 pt-2">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="tabular-nums">₹ {fmt(props.subtotalInr)}</dd>
          </div>
          {n(props.discountInr) > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Discount</dt>
              <dd className="tabular-nums">₹ {fmt(props.discountInr)}</dd>
            </div>
          ) : null}
          {gst && n(props.cgstInr) > 0 ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">CGST</dt>
                <dd className="tabular-nums">₹ {fmt(props.cgstInr)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">SGST</dt>
                <dd className="tabular-nums">₹ {fmt(props.sgstInr)}</dd>
              </div>
            </>
          ) : null}
          {gst && n(props.igstInr) > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">IGST</dt>
              <dd className="tabular-nums">₹ {fmt(props.igstInr)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 pt-2 mt-1 border-t border-slate-400 font-semibold text-[13px] text-slate-900">
            <dt>Amount Payable</dt>
            <dd className="tabular-nums">₹ {fmt(props.totalInr)}</dd>
          </div>
          <p className="text-[10px] italic text-slate-600 text-right pt-0.5">{amountInWordsInr(props.totalInr)}</p>
          {n(props.amountPaidInr) > 0 ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Paid</dt>
                <dd className="tabular-nums">₹ {fmt(props.amountPaidInr)}</dd>
              </div>
              <div className="flex justify-between gap-4 font-medium">
                <dt>Balance due</dt>
                <dd className="tabular-nums">₹ {fmt(balance)}</dd>
              </div>
            </>
          ) : null}
        </dl>
      </div>

      <footer className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-600 space-y-1 print:mt-6">
        {props.seller.bankDetails?.trim() ? <p className="whitespace-pre-line">{props.seller.bankDetails}</p> : null}
        {props.paymentTerms ? <p>Payment terms: {props.paymentTerms}</p> : null}
        {props.notes ? <p>Notes: {props.notes}</p> : null}
        {props.seller.invoiceFooter ? <p>{props.seller.invoiceFooter}</p> : null}
        <p className="text-slate-500 pt-2">This is a computer-generated invoice. E. &amp; O.E.</p>
        <div className="pt-6 print:pt-4">
          <p className="text-slate-700">Authorised signatory</p>
          <p className="border-t border-slate-400 w-44 mt-8 pt-1 text-slate-800">{props.seller.tradeName || props.seller.legalName}</p>
        </div>
      </footer>
    </article>
  );
}
