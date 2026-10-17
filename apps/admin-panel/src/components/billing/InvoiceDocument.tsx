'use client';

import type { SellerProfile } from '@/lib/billing-types';
import { amountInWordsInr } from '@/lib/amount-in-words';
import { gstinFormatHint } from '@/lib/gstin-format';
import type { InvoiceSheetLayout } from '@/lib/invoice-sheet-layout';

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
  sheetLayout?: InvoiceSheetLayout;
};

function n(v: string | number | undefined | null) {
  return Number(v ?? 0);
}

function fmt(v: string | number | undefined | null) {
  return n(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function paymentLabel(status: string, total: number, paid: number) {
  if (status === 'CANCELLED') return 'Cancelled';
  if (paid > 0 && paid + 0.001 >= total) return 'Paid';
  return 'Unpaid';
}

const JEWELLERY_LOGO = '/assets/logos/jewellery-logo.png';

export function InvoiceDocument(props: InvoiceDocumentProps) {
  const gst = props.gstApplied !== false;
  const paid = n(props.amountPaidInr);
  const total = n(props.totalInr);
  const balance = Math.max(0, total - paid);
  const statusLabel = paymentLabel(props.status, total, paid);
  const showStatus = !['PREVIEW', 'SAMPLE'].includes(props.status);
  const sheetLayout = props.sheetLayout ?? 'compact';
  const sheetClass = sheetLayout === 'compact' ? 'invoice-a4-sheet invoice-a4-sheet--compact' : 'invoice-a4-sheet invoice-a4-sheet--full';
  const logoSrc = props.seller.logoUrl?.trim() || JEWELLERY_LOGO;
  const shopTitle = props.seller.tradeName || props.seller.legalName || '';
  const gstHint = gst && props.seller.gstin ? gstinFormatHint(props.seller.gstin) : null;

  return (
    <article className={`${sheetClass} invoice-a4 box-border mx-auto w-full max-w-[210mm] bg-white text-[#1e3a5f] shadow-lg print:shadow-none`} aria-label="Invoice">
      <div className="invoice-a4-inner box-border min-w-0">
        <header className="flex flex-wrap gap-4 items-start border-b border-[#c4a574] pb-4 mb-4 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="JK Balaji" className="h-14 w-14 max-h-14 max-w-[4.5rem] object-contain shrink-0" />
          <div className="min-w-0 flex-1">
            {shopTitle ? <p className="text-base font-semibold tracking-wide text-[#1e3a5f] break-words">{shopTitle}</p> : null}
            {props.seller.legalName && props.seller.legalName !== shopTitle ? (
              <p className="text-[11px] text-slate-600 break-words">{props.seller.legalName}</p>
            ) : null}
            {props.seller.address ? <p className="text-[11px] text-slate-600 whitespace-pre-line break-words mt-1">{props.seller.address}</p> : null}
            <p className="text-[11px] text-slate-600 mt-1 break-words">
              {[props.seller.phone, props.seller.email].filter(Boolean).join(' · ')}
            </p>
            {gst && props.seller.gstin ? (
              <p className="text-[11px] text-slate-700 mt-0.5 break-all">
                GSTIN {props.seller.gstin.toUpperCase()}
                {gstHint ? <span className="block text-[10px] text-slate-500">{gstHint}</span> : null}
              </p>
            ) : null}
          </div>
          <div className="text-right shrink-0 min-w-0 max-w-[42%]">
            <p className="text-lg font-semibold tracking-[0.18em] text-[#1e3a5f]">INVOICE</p>
            <p className="text-xs mt-1 break-all">
              <span className="text-slate-500">No. </span>
              {props.invoiceNo}
            </p>
            <p className="text-xs">
              <span className="text-slate-500">Date </span>
              {new Date(props.invoiceDate).toLocaleDateString('en-IN')}
            </p>
            {props.dueDate ? (
              <p className="text-xs">
                <span className="text-slate-500">Due </span>
                {new Date(props.dueDate).toLocaleDateString('en-IN')}
              </p>
            ) : null}
            {showStatus ? (
              <p className="text-[11px] font-semibold mt-1 uppercase tracking-wide text-[#1e3a5f]">{statusLabel}</p>
            ) : null}
          </div>
        </header>

        <section className="mb-4 min-w-0 text-xs">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a6a3b] mb-1">Customer</p>
          <p className="font-medium break-words">{props.customer.name}</p>
          <p className="text-slate-700 break-words">{props.customer.phone}</p>
          {props.customer.email ? <p className="text-slate-700 break-all">{props.customer.email}</p> : null}
          {props.customer.address ? <p className="text-slate-700 whitespace-pre-line break-words mt-0.5">{props.customer.address}</p> : null}
          {props.customer.gstin ? <p className="text-slate-700 break-all mt-0.5">GSTIN {props.customer.gstin.toUpperCase()}</p> : null}
        </section>

        <table className="invoice-lines w-full table-fixed border-collapse text-[11px]">
          <thead>
            <tr className="border-y border-[#1e3a5f]/30 text-[10px] uppercase tracking-wide text-slate-600">
              <th className="text-left py-1.5 pr-2 font-semibold w-[34%]">Description</th>
              {gst ? <th className="text-left py-1.5 px-1 font-semibold w-[12%]">HSN</th> : null}
              <th className="text-right py-1.5 px-1 font-semibold w-[10%]">Qty</th>
              <th className="text-right py-1.5 px-1 font-semibold w-[14%]">Rate</th>
              <th className="text-right py-1.5 pl-1 font-semibold w-[16%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {props.lines.map((l, i) => (
              <tr key={i} className="border-b border-slate-200 align-top">
                <td className="py-1.5 pr-2 break-words">{l.description}</td>
                {gst ? <td className="py-1.5 px-1 break-all text-slate-600">{l.hsnSac ?? '—'}</td> : null}
                <td className="py-1.5 px-1 text-right tabular-nums whitespace-nowrap">{l.qty}</td>
                <td className="py-1.5 px-1 text-right tabular-nums whitespace-nowrap">{fmt(l.rateInr)}</td>
                <td className="py-1.5 pl-1 text-right tabular-nums whitespace-nowrap font-medium">{fmt(l.amountInr)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end break-inside-avoid">
          <dl className="w-full max-w-[16rem] min-w-0 space-y-1 text-[11px]">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="tabular-nums whitespace-nowrap">₹ {fmt(props.subtotalInr)}</dd>
            </div>
            {n(props.discountInr) > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Discount</dt>
                <dd className="tabular-nums whitespace-nowrap">₹ {fmt(props.discountInr)}</dd>
              </div>
            ) : null}
            {gst && n(props.cgstInr) > 0 ? (
              <>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">CGST</dt>
                  <dd className="tabular-nums whitespace-nowrap">₹ {fmt(props.cgstInr)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">SGST</dt>
                  <dd className="tabular-nums whitespace-nowrap">₹ {fmt(props.sgstInr)}</dd>
                </div>
              </>
            ) : null}
            {gst && n(props.igstInr) > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">IGST</dt>
                <dd className="tabular-nums whitespace-nowrap">₹ {fmt(props.igstInr)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-[#1e3a5f]/40 pt-1.5 font-semibold text-[13px]">
              <dt>Total</dt>
              <dd className="tabular-nums whitespace-nowrap">₹ {fmt(props.totalInr)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Amount paid</dt>
              <dd className="tabular-nums whitespace-nowrap">₹ {fmt(paid)}</dd>
            </div>
            <div className="flex justify-between gap-3 font-medium">
              <dt>Outstanding</dt>
              <dd className="tabular-nums whitespace-nowrap">₹ {fmt(balance)}</dd>
            </div>
            {showStatus ? (
              <div className="flex justify-between gap-3 pt-1">
                <dt className="text-slate-600">Payment status</dt>
                <dd className="font-semibold">{statusLabel}</dd>
              </div>
            ) : null}
            <p className="text-[10px] italic text-slate-500 text-right pt-1 break-words">{amountInWordsInr(props.totalInr)}</p>
          </dl>
        </div>

        <footer className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-600 space-y-1 break-inside-avoid">
          {props.seller.bankDetails?.trim() ? <p className="whitespace-pre-line break-words">{props.seller.bankDetails}</p> : null}
          {props.paymentTerms ? <p className="break-words">Payment terms: {props.paymentTerms}</p> : null}
          {props.notes ? <p className="break-words">Notes: {props.notes}</p> : null}
          {props.seller.invoiceFooter ? <p className="break-words">{props.seller.invoiceFooter}</p> : null}
          <div className="pt-6">
            <p className="text-slate-700">Authorised signatory</p>
            <p className="border-t border-slate-400 w-44 max-w-full mt-8 pt-1 text-slate-800 break-words">{shopTitle}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}
