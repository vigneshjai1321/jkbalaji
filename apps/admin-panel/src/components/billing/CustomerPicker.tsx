'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { adminFetch } from '@/lib/admin-api';
import { AdminBtnSecondary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useAdminTheme } from '@/components/admin/AdminShell';

export type BillingCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  gstin?: string | null;
};

type Props = {
  value: string;
  onChange: (customerId: string, customer?: BillingCustomer) => void;
};

function CustomerFormFields({
  input,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  gstin,
  setGstin,
}: {
  input: string;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  gstin: string;
  setGstin: (v: string) => void;
}) {
  return (
    <>
      <input className={input} placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} placeholder="Phone *" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input className={input} placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea className={input} placeholder="Address (optional)" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
      <input className={input} placeholder="GSTIN (optional)" value={gstin} onChange={(e) => setGstin(e.target.value)} />
    </>
  );
}

export function CustomerPicker({ value, onChange }: Props) {
  const input = useAdminInputClass();
  const dark = useAdminTheme() === 'dark';
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGstin, setEditGstin] = useState('');

  const search = useQuery({
    queryKey: ['billing-customer-search', query],
    queryFn: () => adminFetch<BillingCustomer[]>(`/billing/customers?q=${encodeURIComponent(query)}&limit=20`),
    enabled: query.trim().length >= 1,
  });

  const selected = useQuery({
    queryKey: ['billing-customer', value],
    queryFn: () => adminFetch<BillingCustomer>(`/billing/customers/${value}`),
    enabled: Boolean(value),
  });

  const update = useMutation({
    mutationFn: () =>
      adminFetch<BillingCustomer>(`/billing/customers/${value}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim() || null,
          address: editAddress.trim() || null,
          gstin: editGstin.trim() || null,
        }),
      }),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['billing-customer', value] });
      onChange(c.id, c);
      setShowEdit(false);
    },
  });

  const create = useMutation({
    mutationFn: () =>
      adminFetch<BillingCustomer>('/billing/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim() || undefined,
          address: newAddress.trim() || undefined,
          gstin: newGstin.trim() || undefined,
        }),
      }),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['billing-customer-search'] });
      setShowNew(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewAddress('');
      setNewGstin('');
      setQuery(c.name);
      onChange(c.id, c);
      setOpen(false);
    },
  });

  const options = useMemo(() => search.data ?? [], [search.data]);

  const cardBorder = dark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50/80';
  const dropdown = dark ? 'border-white/10 bg-slate-900 shadow-xl' : 'border-slate-200 bg-white shadow-lg';

  return (
    <div className="relative">
      {value && selected.data ? (
        <div className={clsx('rounded-lg border p-3 text-sm', cardBorder)}>
          <p className={clsx('font-semibold', dark ? 'text-white' : 'text-slate-900')}>{selected.data.name}</p>
          <p className={dark ? 'text-slate-400' : 'text-slate-600'}>
            {selected.data.phone}
            {selected.data.email ? ` · ${selected.data.email}` : ''}
          </p>
          {selected.data.address ? (
            <p className={clsx('mt-1 whitespace-pre-line', dark ? 'text-slate-500' : 'text-slate-600')}>{selected.data.address}</p>
          ) : null}
          {selected.data.gstin ? <p className={dark ? 'text-slate-500' : 'text-slate-600'}>GSTIN: {selected.data.gstin}</p> : null}
          <div className="flex flex-wrap gap-3 mt-2">
            <button type="button" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline" onClick={() => onChange('', undefined)}>
              Change customer
            </button>
            <button
              type="button"
              className={clsx('text-xs hover:underline', dark ? 'text-slate-400' : 'text-slate-600')}
              onClick={() => {
                setEditName(selected.data!.name);
                setEditPhone(selected.data!.phone);
                setEditEmail(selected.data!.email ?? '');
                setEditAddress(selected.data!.address ?? '');
                setEditGstin(selected.data!.gstin ?? '');
                setShowEdit(true);
              }}
            >
              Edit customer
            </button>
          </div>
          {showEdit ? (
            <div className={clsx('mt-3 grid gap-2 p-3 rounded-lg border', dark ? 'border-white/10 bg-slate-900/40' : 'border-slate-200 bg-white')}>
              <CustomerFormFields
                input={input}
                name={editName}
                setName={setEditName}
                phone={editPhone}
                setPhone={setEditPhone}
                email={editEmail}
                setEmail={setEditEmail}
                address={editAddress}
                setAddress={setEditAddress}
                gstin={editGstin}
                setGstin={setEditGstin}
              />
              <div className="flex gap-2">
                <AdminBtnSecondary type="button" disabled={update.isPending} onClick={() => update.mutate()}>
                  Save
                </AdminBtnSecondary>
                <button type="button" className="text-xs text-slate-500" onClick={() => setShowEdit(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!value ? (
        <>
          <input
            className={input}
            placeholder="Type name, phone, or email to search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          {open && query.trim() ? (
            <ul className={clsx('absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border text-sm', dropdown)}>
              {search.isLoading ? <li className="p-3 text-slate-500">Searching…</li> : null}
              {options.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={clsx('w-full text-left px-3 py-2', dark ? 'hover:bg-white/5' : 'hover:bg-slate-50')}
                    onClick={() => {
                      onChange(c.id, c);
                      setQuery(c.name);
                      setOpen(false);
                    }}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-slate-500 ml-2">{c.phone}</span>
                  </button>
                </li>
              ))}
              {!search.isLoading && options.length === 0 ? (
                <li className="p-3 text-slate-500">No matches — add as new customer.</li>
              ) : null}
            </ul>
          ) : null}
          <div className="mt-2">
            <AdminBtnSecondary type="button" className="!py-1.5 !px-3 !text-xs" onClick={() => setShowNew(true)}>
              + New customer
            </AdminBtnSecondary>
          </div>
        </>
      ) : null}

      {showNew ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className={clsx('w-full max-w-md rounded-xl border p-4 shadow-xl grid gap-2', dark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white')}>
            <h3 className={clsx('text-sm font-semibold', dark ? 'text-white' : 'text-slate-900')}>New customer</h3>
            <CustomerFormFields
              input={input}
              name={newName}
              setName={setNewName}
              phone={newPhone}
              setPhone={setNewPhone}
              email={newEmail}
              setEmail={setNewEmail}
              address={newAddress}
              setAddress={setNewAddress}
              gstin={newGstin}
              setGstin={setNewGstin}
            />
            <div className="flex gap-2 pt-1">
              <AdminBtnSecondary
                type="button"
                disabled={!newName.trim() || !newPhone.trim() || create.isPending}
                onClick={() => create.mutate()}
              >
                Save customer
              </AdminBtnSecondary>
              <button
                type="button"
                className="text-xs text-slate-500"
                onClick={() => {
                  setShowNew(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
