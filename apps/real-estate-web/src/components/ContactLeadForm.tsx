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
  variant = 'default',
  preferredProjectOptions,
  defaultPreferredProject,
  submitLabel = 'Submit Enquiry',
}: {
  site: Site;
  propertyId?: string;
  projectSlug?: string;
  leadType?: string;
  sourcePage?: string;
  variant?: 'default' | 'property';
  preferredProjectOptions?: readonly { value: string; label: string }[];
  defaultPreferredProject?: string;
  submitLabel?: string;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredProject, setPreferredProject] = useState(defaultPreferredProject ?? '');
  const [requirements, setRequirements] = useState('');
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
    if (variant === 'property' && preferredProjectOptions?.length && !preferredProject.trim()) {
      setErrMsg('Please select a preferred project or location.');
      return;
    }
    if (variant === 'property' && requirements.trim().length < 3) {
      setErrMsg('Please briefly describe your property requirements.');
      return;
    }
    setSubmitting(true);
    try {
      const fromQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('project') : null;
      const selected = preferredProjectOptions?.find((o) => o.value === preferredProject);
      const messageParts = [
        variant === 'property' && selected ? `Preferred project/location: ${selected.label}` : null,
        variant === 'property' && defaultPreferredProject && !selected ? `Preferred project/location: ${defaultPreferredProject}` : null,
        variant === 'property' && requirements.trim() ? `Property requirements: ${requirements.trim()}` : null,
        message.trim() || null,
      ].filter(Boolean) as string[];
      const composedMessage = messageParts.length ? messageParts.join('\n\n') : undefined;
      const slugFromPreferred =
        preferredProject.startsWith('jk-nagar-') ? preferredProject : projectSlug || fromQuery || undefined;
      await apiPost('/public/leads', {
        site,
        leadType,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: composedMessage,
        propertyId,
        projectSlug: slugFromPreferred,
        sourcePage: sourcePage ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
      });
      setStatus('ok');
      setName('');
      setPhone('');
      setEmail('');
      setPreferredProject(defaultPreferredProject ?? '');
      setRequirements('');
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
      {variant === 'property' && preferredProjectOptions?.length ? (
        <>
          <label className="sr-only" htmlFor="lead-preferred-project">
            Preferred project or location
          </label>
          <select
            id="lead-preferred-project"
            required
            className="border rounded-lg px-3 py-2 bg-white"
            value={preferredProject}
            onChange={(e) => setPreferredProject(e.target.value)}
            disabled={submitting}
          >
            <option value="">Preferred project or location *</option>
            {preferredProjectOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
      {variant === 'property' ? (
        <textarea
          required
          minLength={3}
          className="border rounded-lg px-3 py-2"
          placeholder="Property requirements (budget, plot size, timeline, etc.) *"
          rows={3}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          disabled={submitting}
        />
      ) : null}
      {variant === 'default' ? (
        <input
          type="email"
          className="border rounded-lg px-3 py-2"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
      ) : null}
      <textarea
        className="border rounded-lg px-3 py-2"
        placeholder={variant === 'property' ? 'Optional message' : 'Message'}
        rows={variant === 'property' ? 2 : 3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={submitting}
        className={`rounded-lg text-white px-4 py-2 font-medium disabled:opacity-60 ${accent}`}
      >
        {submitting ? 'Submitting…' : submitLabel}
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
