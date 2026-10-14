'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { adminFetch } from '@/lib/admin-api';
import { useAdminTheme } from '@/components/admin/AdminShell';
import { clsx } from 'clsx';

function strengthHint(pw: string) {
  if (pw.length < 10) return { label: 'Too short (min 10 characters)', ok: false };
  const hasMix = /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw);
  if (!hasMix) return { label: 'Add upper, lower case and a number', ok: false };
  return { label: 'Meets requirements', ok: true };
}

export default function ProfileSecurityPage() {
  const { user } = useAdminAuth();
  const dark = useAdminTheme() === 'dark';
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState({ cur: false, next: false, conf: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const hint = strengthHint(next);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) {
      setMsg({ type: 'err', text: 'New password and confirmation do not match.' });
      return;
    }
    if (!hint.ok) {
      setMsg({ type: 'err', text: hint.label });
      return;
    }
    setLoading(true);
    try {
      await adminFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      setMsg({ type: 'ok', text: 'Password updated. Other sessions were signed out; sign in again on other devices if needed.' });
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Could not change password. Check your current password.',
      });
    } finally {
      setLoading(false);
    }
  }

  const inputCls = clsx(
    'w-full rounded-lg border px-3 py-2.5 text-sm pr-10',
    dark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
  );

  return (
    <AdminPanel title="Profile & Security" description="Manage your account and sign-in credentials.">
      <div className="grid gap-8 lg:grid-cols-2 max-w-4xl">
        <div className={clsx('rounded-2xl border p-6', dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium">{user?.role?.replaceAll('_', ' ')}</dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={(e) => void onSave(e)}
          className={clsx('rounded-2xl border p-6 space-y-4', dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')}
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Change password</h2>
          <p className="text-xs text-slate-500">
            Minimum 10 characters with upper and lower case letters and a number. Your current password is required.
          </p>

          {(['cur', 'next', 'conf'] as const).map((key) => {
            const labels = { cur: 'Current password', next: 'New password', conf: 'Confirm new password' };
            const values = { cur: current, next: next, conf: confirm };
            const setters = {
              cur: setCurrent,
              next: setNext,
              conf: setConfirm,
            };
            return (
              <label key={key} className="grid gap-1 text-xs font-medium text-slate-500">
                {labels[key]}
                <span className="relative block">
                  <input
                    type={show[key] ? 'text' : 'password'}
                    autoComplete={key === 'cur' ? 'current-password' : 'new-password'}
                    className={inputCls}
                    value={values[key]}
                    onChange={(e) => setters[key](e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                    aria-label={show[key] ? 'Hide password' : 'Show password'}
                    onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                  >
                    {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
            );
          })}

          {next ? (
            <p className={clsx('text-xs', hint.ok ? 'text-emerald-600' : 'text-amber-600')}>{hint.label}</p>
          ) : null}

          {msg ? (
            <p className={clsx('text-sm', msg.type === 'ok' ? 'text-emerald-600' : 'text-red-600')}>{msg.text}</p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save password'}
            </button>
            <button
              type="button"
              className={clsx(
                'rounded-xl border px-5 py-2.5 text-sm font-semibold',
                dark ? 'border-white/15' : 'border-slate-300',
              )}
              onClick={() => {
                setCurrent('');
                setNext('');
                setConfirm('');
                setMsg(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminPanel>
  );
}
