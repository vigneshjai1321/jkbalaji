import type { ReactNode } from 'react';
import Link from 'next/link';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { RE_ROUTES } from '@/lib/site-routes';

export function RePageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
}) {
  return (
    <header className="re-container py-6 md:py-8">
      {breadcrumbs}
      {eyebrow ? <p className="re-eyebrow">{eyebrow}</p> : null}
      <h1 className="re-heading mt-1 text-[clamp(1.5rem,2.5vw,2rem)]">{title}</h1>
      {description ? <p className="re-subheading mt-2 max-w-2xl text-base">{description}</p> : null}
    </header>
  );
}

export function ReBreadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="text-xs md:text-sm text-slate-600 mb-3" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 ? <span className="mx-1.5 text-slate-400">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-emerald-800">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function ReInnerBand({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`re-inner-band border-t border-slate-200/80 bg-white ${className}`}>
      <div className="re-container py-5 md:py-6">{children}</div>
    </section>
  );
}

const BUY_STEPS = ['Enquiry', 'Site visit', 'Plot selection', 'Documentation', 'Registration'] as const;

export function ReBuyingProcessCompact() {
  return (
    <ReInnerBand className="bg-slate-50/90">
      <h2 className="text-base font-semibold text-slate-900">Typical buying process</h2>
      <p className="mt-1 text-sm text-slate-600 max-w-2xl">Timings and documents vary by project — confirm with our team.</p>
      <ol className="mt-4 flex flex-wrap gap-2 md:gap-3">
        {BUY_STEPS.map((step, i) => (
          <li
            key={step}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs md:text-sm text-slate-800"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-bold text-white">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </ReInnerBand>
  );
}

export function ReEnquireCtaBar({
  title = 'Ready to enquire?',
  detail = 'Call, WhatsApp, or use our contact form — we confirm availability before site visits.',
  href = RE_ROUTES.contact,
  label = 'Enquire now',
}: {
  title?: string;
  detail?: string;
  href?: string;
  label?: string;
}) {
  return (
    <ReInnerBand className="bg-emerald-900/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600 max-w-xl">{detail}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href={href} className="inline-flex rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
            {label}
          </Link>
          <a
            href={`https://wa.me/${JK_BALAJI_RE.whatsappNumber}?text=${encodeURIComponent('Property enquiry — JK Balaji')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </ReInnerBand>
  );
}

export function ReAvailabilityNote() {
  return (
    <ReInnerBand>
      <h2 className="text-base font-semibold text-slate-900">Confirming availability</h2>
      <p className="mt-2 text-sm text-slate-600 max-w-2xl">
        Listings reflect published data from our system. Plot numbers, dimensions, and final price are confirmed on call or during a
        guided site visit — we do not hold plots online.
      </p>
    </ReInnerBand>
  );
}

export function ReProjectsQuickLinks() {
  return (
    <ReInnerBand className="bg-slate-50/90">
      <h2 className="text-base font-semibold text-slate-900">Explore projects</h2>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <Link href={RE_ROUTES.projects} className="text-emerald-800 font-medium hover:underline">
          All projects
        </Link>
        <span className="text-slate-300">·</span>
        <Link href={RE_ROUTES.jkNagar} className="text-emerald-800 font-medium hover:underline">
          JK Nagar
        </Link>
        <span className="text-slate-300">·</span>
        <Link href={RE_ROUTES.properties} className="text-emerald-800 font-medium hover:underline">
          Properties
        </Link>
      </div>
    </ReInnerBand>
  );
}

export function ReAboutServicesLinks() {
  return (
    <ReInnerBand>
      <h2 className="text-base font-semibold text-slate-900">What we help with</h2>
      <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc pl-5 max-w-xl">
        <li>Published layouts and JK Nagar phases (all phases shown as ongoing on the public site)</li>
        <li>Guided site visits and documentation support through registration</li>
      </ul>
      <Link href={RE_ROUTES.projects} className="mt-3 inline-block text-sm font-semibold text-emerald-800 hover:underline">
        View projects →
      </Link>
    </ReInnerBand>
  );
}

export function ReLocationContactStrip() {
  return (
    <ReInnerBand className="bg-slate-50/90">
      <h2 className="text-base font-semibold text-slate-900">Directions & contact</h2>
      <p className="mt-1 text-sm text-slate-600">{JK_BALAJI_RE.location}</p>
      <p className="mt-2 text-sm">
        <a href={`tel:${JK_BALAJI_RE.phoneE164}`} className="text-emerald-800 font-medium hover:underline">
          {JK_BALAJI_RE.phoneDisplay}
        </a>
        {' · '}
        <Link href={RE_ROUTES.contact} className="text-emerald-800 font-medium hover:underline">
          Enquiry form
        </Link>
      </p>
    </ReInnerBand>
  );
}

export function ReFaqContactCta() {
  return (
    <ReInnerBand>
      <p className="text-sm text-slate-700">
        Still have questions?{' '}
        <Link href={RE_ROUTES.contact} className="font-semibold text-emerald-800 hover:underline">
          Contact our team
        </Link>{' '}
        or WhatsApp for a quick response.
      </p>
    </ReInnerBand>
  );
}

export function ReContactGuide() {
  return (
    <ReInnerBand className="bg-slate-50/90">
      <h2 className="text-base font-semibold text-slate-900">How to enquire</h2>
      <ol className="mt-2 text-sm text-slate-600 space-y-1 list-decimal pl-5 max-w-lg">
        <li>Share your name, phone, and project or phase of interest.</li>
        <li>We confirm availability and arrange a site visit when applicable.</li>
        <li>Documentation and registration steps are explained for your chosen plot.</li>
      </ol>
    </ReInnerBand>
  );
}
