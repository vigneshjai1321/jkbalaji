'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { SRI_BALAJI } from '@/lib/jewellery-business';

type Site = 'REAL_ESTATE' | 'JEWELLERY';

function validPhone(p: string) {
  return /^[\d+\-\s()]{8,15}$/.test(p);
}

export function ContactLeadForm({
  site,
  propertyId,
  projectSlug,
  leadType = 'GENERAL_CONTACT',
  sourcePage,
}: {
  site: Site;
  propertyId?: string;
  projectSlug?: string;
  leadType?: string;
  sourcePage?: string;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setStatus('idle');
    setErrMsg('');
    if (honeypot.trim()) return;
    if (name.trim().length < 2) {
      setErrMsg('Please enter your name.');
      return;
    }
    if (!validPhone(phone.trim())) {
      setErrMsg('Please enter a valid phone number.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrMsg('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const fromQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('project') : null;
      await apiPost('/public/leads', {
        site,
        leadType,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        propertyId,
        projectSlug: projectSlug || fromQuery || undefined,
        sourcePage: sourcePage ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
      });
      setStatus('ok');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('err');
      setErrMsg(
        site === 'JEWELLERY'
          ? `Could not submit online. Please call ${SRI_BALAJI.phoneDisplay} or visit our showroom.`
          : `Could not submit online. Email us at ${JK_BALAJI_RE.email} or call ${JK_BALAJI_RE.phoneDisplay}.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const accent = site === 'REAL_ESTATE' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-amber-700 hover:bg-amber-800';

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 max-w-lg" noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />
      <input
        required
        minLength={2}
        className="border rounded-lg px-3 py-2"
        placeholder="Your name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={submitting}
      />
      <input
        required
        className="border rounded-lg px-3 py-2"
        placeholder="Phone *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={submitting}
      />
      <input
        type="email"
        className="border rounded-lg px-3 py-2"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />
      <textarea
        className="border rounded-lg px-3 py-2"
        placeholder="Message"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={submitting}
        className={`rounded-lg text-white px-4 py-2 font-medium disabled:opacity-60 ${accent}`}
      >
        {submitting ? 'Submitting…' : 'Submit Enquiry'}
      </button>
      {status === 'ok' ? (
        <p className="text-sm text-emerald-700 font-medium" role="status">
          Thank you — your enquiry was received. Our team will contact you shortly.
        </p>
      ) : null}
      {status === 'err' || errMsg ? <p className="text-sm text-red-600">{errMsg || 'Submission failed.'}</p> : null}
    </form>
  );
}
