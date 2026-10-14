'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, AdminBtnSecondary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { useAdminTheme } from '@/components/admin/AdminShell';
import { clsx } from 'clsx';

type Account = { id: string; code: string; name: string; type: string };

type JournalLine = {
  id: string;
  debitInr: string;
  creditInr: string;
  account: { code: string; name: string };
};

type JournalEntry = {
  id: string;
  entryDate: string;
  narration: string | null;
  lines: JournalLine[];
};

type DraftLine = { accountId: string; debit: string; credit: string };

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'] as const;

function inr(value: string | number) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function emptyLine(): DraftLine {
  return { accountId: '', debit: '', credit: '' };
}

export default function AccountingPage() {
  const input = useAdminInputClass();
  const dark = useAdminTheme() === 'dark';
  const { token, ready: authReady } = useAdminAuth();
  const qc = useQueryClient();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof ACCOUNT_TYPES)[number]>('EXPENSE');
  const [accountError, setAccountError] = useState('');

  const [showJournalForm, setShowJournalForm] = useState(false);
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState('');
  const [draftLines, setDraftLines] = useState<DraftLine[]>([emptyLine(), emptyLine()]);
  const [journalError, setJournalError] = useState('');

  const enabled = authReady && !!token;

  const accounts = useQuery({
    queryKey: ['erp-accounts'],
    queryFn: () => adminFetch<Account[]>('/erp/accounts'),
    enabled,
  });

  const journal = useQuery({
    queryKey: ['erp-journal'],
    queryFn: () => adminFetch<JournalEntry[]>('/erp/journal'),
    enabled,
  });

  const addAccount = useMutation({
    mutationFn: () => adminFetch('/erp/accounts', { method: 'POST', body: JSON.stringify({ code, name, type }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp-accounts'] });
      setCode('');
      setName('');
      setAccountError('');
    },
    onError: (err: Error) => setAccountError(err.message),
  });

  const postJournal = useMutation({
    mutationFn: () =>
      adminFetch('/erp/journal', {
        method: 'POST',
        body: JSON.stringify({
          entryDate,
          narration: narration || undefined,
          lines: draftLines.map((l) => ({
            accountId: l.accountId,
            debitInr: l.debit ? Number(l.debit) : 0,
            creditInr: l.credit ? Number(l.credit) : 0,
          })),
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp-journal'] });
      setShowJournalForm(false);
      setNarration('');
      setDraftLines([emptyLine(), emptyLine()]);
      setJournalError('');
    },
    onError: (err: Error) => setJournalError(err.message),
  });

  const { debitTotal, creditTotal, balanced } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    for (const line of draftLines) {
      debit += line.debit ? Number(line.debit) : 0;
      credit += line.credit ? Number(line.credit) : 0;
    }
    return {
      debitTotal: debit,
      creditTotal: credit,
      balanced: Math.abs(debit - credit) < 0.01 && debit > 0,
    };
  }, [draftLines]);

  const journalRows = useMemo(() => {
    return (journal.data ?? []).map((entry) => {
      const debit = entry.lines.reduce((s, l) => s + Number(l.debitInr), 0);
      const credit = entry.lines.reduce((s, l) => s + Number(l.creditInr), 0);
      const ref = entry.id.slice(-8).toUpperCase();
      const date = entry.entryDate.slice(0, 10);
      return [date, ref, entry.narration ?? '—', inr(debit), inr(credit), 'Posted'] as const;
    });
  }, [journal.data]);

  const labelClass = clsx('block text-xs font-medium mb-1', dark ? 'text-slate-400' : 'text-slate-600');

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <AdminPanel title="Chart of Accounts" description="Ledger accounts for trial balance, P&amp;L, and balance sheet.">
        <form
          className="flex flex-col gap-3 border-b border-inherit p-4 sm:p-5 lg:flex-row lg:flex-wrap lg:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setAccountError('');
            addAccount.mutate();
          }}
        >
          <label className="w-full min-w-[6rem] flex-1 sm:max-w-[8rem]">
            <span className={labelClass}>Code</span>
            <input className={input} value={code} onChange={(e) => setCode(e.target.value)} placeholder="1000" required />
          </label>
          <label className="w-full min-w-[10rem] flex-[2] sm:min-w-[12rem]">
            <span className={labelClass}>Account name</span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Cash in hand" required />
          </label>
          <label className="w-full min-w-[8rem] flex-1 sm:max-w-[11rem]">
            <span className={labelClass}>Type</span>
            <select className={input} value={type} onChange={(e) => setType(e.target.value as (typeof ACCOUNT_TYPES)[number])}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <AdminBtnPrimary type="submit" disabled={addAccount.isPending} className="h-[42px] w-full shrink-0 sm:w-auto px-5">
            {addAccount.isPending ? 'Saving…' : 'Add account'}
          </AdminBtnPrimary>
          {accountError ? <p className="w-full text-sm text-red-600">{accountError}</p> : null}
        </form>

        {accounts.isLoading ? (
          <p className="p-5 text-sm opacity-60">Loading accounts…</p>
        ) : (accounts.data ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No accounts yet. Add your first account above.</p>
        ) : (
          <AdminTable headers={['Code', 'Name', 'Type']} rows={(accounts.data ?? []).map((a) => [a.code, a.name, a.type])} />
        )}
      </AdminPanel>

      <AdminPanel
        title="Journal Entries"
        description="Double-entry day book."
        actions={
          <AdminBtnPrimary type="button" className="h-9 px-4 text-sm" onClick={() => setShowJournalForm((v) => !v)}>
            {showJournalForm ? 'Close' : 'Create journal entry'}
          </AdminBtnPrimary>
        }
      >
        {showJournalForm ? (
          <div className="space-y-4 border-b border-inherit p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Date</span>
                <input type="date" className={input} value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
              </label>
              <label className="sm:col-span-1">
                <span className={labelClass}>Description</span>
                <input className={input} value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Payment received" />
              </label>
            </div>

            <div className="overflow-x-auto -mx-1">
              <table className="w-full min-w-[640px] text-sm">
                <thead className={dark ? 'text-slate-400' : 'text-slate-600'}>
                  <tr>
                    <th className="pb-2 pr-2 text-left font-medium">Account</th>
                    <th className="pb-2 px-2 text-right font-medium w-28">Debit (₹)</th>
                    <th className="pb-2 px-2 text-right font-medium w-28">Credit (₹)</th>
                    <th className="pb-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {draftLines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-2">
                        <select
                          className={input}
                          value={line.accountId}
                          onChange={(e) => {
                            const next = [...draftLines];
                            next[idx] = { ...line, accountId: e.target.value };
                            setDraftLines(next);
                          }}
                          required
                        >
                          <option value="">Select account</option>
                          {(accounts.data ?? []).map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} — {a.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={clsx(input, 'text-right')}
                          value={line.debit}
                          onChange={(e) => {
                            const next = [...draftLines];
                            next[idx] = { accountId: line.accountId, debit: e.target.value, credit: '' };
                            setDraftLines(next);
                          }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={clsx(input, 'text-right')}
                          value={line.credit}
                          onChange={(e) => {
                            const next = [...draftLines];
                            next[idx] = { accountId: line.accountId, debit: '', credit: e.target.value };
                            setDraftLines(next);
                          }}
                        />
                      </td>
                      <td className="py-1">
                        {draftLines.length > 2 ? (
                          <button
                            type="button"
                            className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                            aria-label="Remove line"
                            onClick={() => setDraftLines(draftLines.filter((_, i) => i !== idx))}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className={clsx('inline-flex items-center gap-1 text-sm font-medium', dark ? 'text-emerald-400' : 'text-emerald-700')}
                onClick={() => setDraftLines([...draftLines, emptyLine()])}
              >
                <Plus size={16} /> Add line
              </button>
              <p className={clsx('text-sm', balanced ? 'text-emerald-600' : 'text-amber-700')}>
                Debits {inr(debitTotal)} · Credits {inr(creditTotal)}
                {!balanced ? ' · Must balance before posting' : ''}
              </p>
            </div>

            {journalError ? <p className="text-sm text-red-600">{journalError}</p> : null}

            <div className="flex flex-wrap gap-2">
              <AdminBtnPrimary type="button" disabled={!balanced || postJournal.isPending || !(accounts.data?.length)} onClick={() => postJournal.mutate()}>
                {postJournal.isPending ? 'Posting…' : 'Post entry'}
              </AdminBtnPrimary>
              <AdminBtnSecondary type="button" onClick={() => setShowJournalForm(false)}>
                Cancel
              </AdminBtnSecondary>
            </div>
            {(accounts.data ?? []).length === 0 ? (
              <p className="text-xs text-amber-700">Create at least two accounts before posting a journal entry.</p>
            ) : null}
          </div>
        ) : null}

        {journal.isLoading ? (
          <p className="p-5 text-sm opacity-60">Loading journal entries…</p>
        ) : journalRows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No journal entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <AdminTable
              headers={['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Status']}
              rows={journalRows.map((r) => [...r])}
            />
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
