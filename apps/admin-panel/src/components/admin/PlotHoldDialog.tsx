'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminBtnPrimary, AdminBtnSecondary, useAdminInputClass } from '@/components/admin/AdminForm';

type Customer = { id: string; name: string; phone: string };

type Props = {
  plotId: string;
  plotNumber: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PlotHoldDialog({ plotId, plotNumber, open, onClose, onSuccess }: Props) {
  const input = useAdminInputClass();
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [holdUntil, setHoldUntil] = useState('');

  const customers = useQuery({
    queryKey: ['hold-customers', customerQuery],
    queryFn: () =>
      adminFetch<Customer[]>(`/billing/customers?q=${encodeURIComponent(customerQuery.trim())}&limit=20`),
    enabled: open,
  });

  const hold = useMutation({
    mutationFn: () =>
      adminFetch(`/erp/plots/${plotId}/hold`, {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          reason: reason.trim() || undefined,
          notes: notes.trim() || undefined,
          holdUntil: holdUntil || undefined,
        }),
      }),
    onSuccess: () => {
      onSuccess();
      onClose();
      setCustomerId('');
      setReason('');
      setNotes('');
      setHoldUntil('');
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-4 text-sm text-slate-900 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        <h2 className="text-base font-semibold">Hold plot {plotNumber}</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Sets status to <strong>RESERVED</strong> (on hold). Does not create a commission or invoice.
        </p>
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            hold.mutate();
          }}
        >
          <label className="block text-xs">
            Search customer
            <input
              className={`${input} mt-0.5 py-1.5 text-sm`}
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              placeholder="Name or phone"
            />
          </label>
          <label className="block text-xs">
            Customer <span className="text-red-600">*</span>
            <select
              className={`${input} mt-0.5 py-1.5 text-sm`}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">Select customer</option>
              {(customers.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.phone}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            Hold until (optional)
            <input type="date" className={`${input} mt-0.5 py-1.5 text-sm`} value={holdUntil} onChange={(e) => setHoldUntil(e.target.value)} />
          </label>
          <label className="block text-xs">
            Reason (optional)
            <input className={`${input} mt-0.5 py-1.5 text-sm`} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <label className="block text-xs">
            Notes (optional)
            <textarea className={`${input} mt-0.5 py-1.5 text-sm min-h-[48px]`} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          {hold.error ? <p className="text-xs text-red-600">{(hold.error as Error).message}</p> : null}
          <div className="flex gap-2 pt-1">
            <AdminBtnPrimary type="submit" disabled={hold.isPending || !customerId}>
              {hold.isPending ? 'Saving…' : 'Confirm hold'}
            </AdminBtnPrimary>
            <AdminBtnSecondary type="button" onClick={onClose}>
              Cancel
            </AdminBtnSecondary>
          </div>
        </form>
      </div>
    </div>
  );
}
