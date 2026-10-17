'use client';

import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';

export function AdminTabUnlock({ theme }: { theme: 'dark' | 'light' }) {
  const { user, verifyTab, logout } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyTab(password);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  const dark = theme === 'dark';

  return (
    <div className={`min-h-screen relative overflow-hidden ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-slate-950" />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-900/40 mb-4">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Verify this tab</h1>
            <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Re-enter your password to open protected ERP data in this browser tab.
              {user?.email ? (
                <>
                  {' '}
                  Signed in as <span className="font-medium text-emerald-400">{user.email}</span>.
                </>
              ) : null}
            </p>
          </div>

          <form
            onSubmit={submit}
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-xl ${
              dark ? 'bg-white/[0.06] border-white/10' : 'bg-white/90 border-slate-200'
            }`}
          >
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
              Password
            </label>
            <div className="relative mb-4">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                className="w-full rounded-xl pl-10 pr-10 py-3 bg-white text-slate-900 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error ? <p className="text-sm text-red-500 mb-4">{error}</p> : null}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-white font-semibold shadow-lg disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Unlock tab'}
            </button>

            <button
              type="button"
              className={`mt-4 w-full text-sm ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => logout()}
            >
              Sign out instead
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
