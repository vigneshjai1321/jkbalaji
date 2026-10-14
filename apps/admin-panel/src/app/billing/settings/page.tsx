'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import type { SellerProfile } from '@/lib/billing-types';
import { BILLING_SUPPORT_EMAIL } from '@/lib/billing-types';
import { gstinFormatHint } from '@/lib/gstin-format';
import { useEffect, useState } from 'react';

export default function BillingSettingsPage() {
  const input = useAdminInputClass();
  const qc = useQueryClient();
  const [form, setForm] = useState<SellerProfile | null>(null);
  const [taxRatesText, setTaxRatesText] = useState('');

  const seller = useQuery({
    queryKey: ['billing-seller'],
    queryFn: () => adminFetch<SellerProfile>('/billing/seller'),
  });

  useEffect(() => {
    if (seller.data && !form) {
      setForm(seller.data);
      setTaxRatesText(seller.data.authorizedTaxRates.join(', '));
    }
  }, [seller.data, form]);

  const save = useMutation({
    mutationFn: () => {
      if (!form) return Promise.reject();
      const rates = taxRatesText
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
      const body = { ...form, authorizedTaxRates: rates.length ? rates : [0, 3, 5, 12, 18] };
      return adminFetch('/billing/seller', { method: 'PATCH', body: JSON.stringify(body) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billing-seller'] }),
  });

  if (seller.isLoading || !form) {
    return <p className="p-8 text-sm text-slate-500">Loading billing settings…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/billing" className="text-sm text-emerald-400 hover:underline">
          ← Billing
        </Link>
        <h1 className="text-xl font-bold">Billing settings</h1>
      </div>
      <p className="text-sm text-slate-500 max-w-2xl">
        Enter the <strong>actual invoice issuer&apos;s</strong> legal details below. These appear on PDFs and printouts. Billing software support:{' '}
        <a href={`mailto:${BILLING_SUPPORT_EMAIL}`} className="text-emerald-400 hover:underline">
          {BILLING_SUPPORT_EMAIL}
        </a>{' '}
        (JK Balaji — not shown as the seller on invoices).
      </p>

      <AdminPanel title="Invoice issuer (seller on invoice)">
        <form
          className="p-4 md:p-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {(
            [
              ['tradeName', 'Trade / display name'],
              ['legalName', 'Legal name'],
              ['gstin', 'GSTIN (required for GST invoices)'],
              ['phone', 'Phone on invoice'],
              ['email', 'Email on invoice'],
              ['stateCode', 'State code (e.g. 33)'],
              ['invoicePrefix', 'Invoice number prefix'],
              ['logoUrl', 'Logo URL (https)'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm sm:col-span-1">
              {label}
              <input
                className={`${input} mt-1`}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, [key]: key === 'gstin' ? e.target.value.toUpperCase() : e.target.value } : f,
                  )
                }
              />
              {key === 'gstin' && form.gstin ? (
                <span className="text-xs text-amber-700 block mt-1">{gstinFormatHint(form.gstin) ?? 'Format check only — verify against your registration.'}</span>
              ) : null}
            </label>
          ))}
          <label className="block text-sm sm:col-span-2">
            Address
            <textarea className={`${input} mt-1`} rows={3} value={form.address} onChange={(e) => setForm((f) => (f ? { ...f, address: e.target.value } : f))} />
          </label>
          <label className="block text-sm sm:col-span-2">
            Default payment terms
            <input className={`${input} mt-1`} value={form.paymentTermsDefault} onChange={(e) => setForm((f) => (f ? { ...f, paymentTermsDefault: e.target.value } : f))} />
          </label>
          <label className="block text-sm sm:col-span-2">
            Bank / payment instructions (on invoice)
            <textarea className={`${input} mt-1`} rows={2} value={form.bankDetails} onChange={(e) => setForm((f) => (f ? { ...f, bankDetails: e.target.value } : f))} />
          </label>
          <label className="block text-sm sm:col-span-2">
            Invoice footer text
            <textarea className={`${input} mt-1`} rows={2} value={form.invoiceFooter} onChange={(e) => setForm((f) => (f ? { ...f, invoiceFooter: e.target.value } : f))} />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2 text-sm">
            <input type="checkbox" checked={form.defaultApplyGst} onChange={(e) => setForm((f) => (f ? { ...f, defaultApplyGst: e.target.checked } : f))} />
            Default new invoices to GST enabled
          </label>
          <label className="block text-sm sm:col-span-2">
            Authorised GST rates (comma-separated %)
            <input className={`${input} mt-1`} value={taxRatesText} onChange={(e) => setTaxRatesText(e.target.value)} placeholder="0, 3, 5, 12, 18" />
          </label>
          <label className="block text-sm sm:col-span-2">
            Billing module contact email (support only)
            <input
              className={`${input} mt-1`}
              value={form.billingContactEmail}
              onChange={(e) => setForm((f) => (f ? { ...f, billingContactEmail: e.target.value } : f))}
            />
          </label>
          <div className="sm:col-span-2">
            <AdminBtnPrimary type="submit" disabled={save.isPending}>
              Save settings
            </AdminBtnPrimary>
            {save.isSuccess ? <span className="ml-3 text-sm text-emerald-400">Saved</span> : null}
          </div>
        </form>
      </AdminPanel>
    </div>
  );
}
