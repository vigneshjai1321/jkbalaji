'use client';

import { useEffect, useState } from 'react';
import { Building2, Eye, EyeOff, Gem, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './AdminAuthContext';

const REMEMBER_KEY = 'jk_admin_remember_email';

export function AdminLogin({ theme }: { theme: 'dark' | 'light' }) {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@jkbalaji.in');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) setEmail(saved);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_KEY);
      await login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const dark = theme === 'dark';

  return (
    <div className={`min-h-screen relative overflow-hidden ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-slate-950" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-900/40 mb-4">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className={`text-3xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Welcome back</h1>
            <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              JK Balaji Enterprise ERP — CRM, Real Estate & Gold Billing
            </p>
          </div>

          <form
            onSubmit={submit}
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-xl ${
              dark ? 'bg-white/[0.06] border-white/10' : 'bg-white/90 border-slate-200'
            }`}
          >
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
              Email or username
            </label>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full rounded-xl pl-10 pr-3 py-3 bg-white text-slate-900 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
              Password
            </label>
            <div className="relative mb-4">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                className="w-full rounded-xl pl-10 pr-11 py-3 bg-white text-slate-900 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm mb-5">
              <label className={`flex items-center gap-2 cursor-pointer ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded accent-emerald-600" />
                Remember me
              </label>
              <a href="mailto:tmlcheyyar@gmail.com?subject=JK%20Balaji%20Admin%20Password%20Reset" className="text-emerald-500 hover:underline text-xs">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-semibold py-3 shadow-lg transition-all"
            >
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
            </button>

            {error ? (
              <p className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            ) : null}
          </form>

          <div className={`mt-6 grid grid-cols-2 gap-3 text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 backdrop-blur">
              <Building2 size={16} className="text-emerald-400" /> Real estate ERP
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 backdrop-blur">
              <Gem size={16} className="text-amber-400" /> Gold billing & CRM
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
